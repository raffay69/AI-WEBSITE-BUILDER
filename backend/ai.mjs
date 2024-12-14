import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';
import bodyParser from 'body-parser';
import { enriching1, enriching2, enriching3, enriching4, enriching5, enriching6, enriching7, enriching8, sysPrompt } from "./prompt.mjs";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors'

const app = express();
app.use(cors());
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());


const genAI = new GoogleGenerativeAI("AIzaSyBbK3k2W8FR7weaxE9WwDIxhXKZT_uVr04");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: sysPrompt });
let previousResponse = null;
let userPreviousResponse = "";
let forFrontend;
let modifyFrontend;

let genReq = ""
app.post('/generate', async (req, res) => {
  const { Prompt } = req.body;
  genReq = Prompt;  // Update genReq with the user input
  if (!Prompt) {
    return res.status(400).send({ error: 'User prompt is required.' });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    await generateContent(genReq);
      // Call the function to generate content
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({ error: 'Error generating content' });
    }
  }
});

async function generateContent(genReq){
const prompt = {
  contents: [
    {
      role: 'user',
      parts: [
        {
          text: enriching1 
         },        
        {
          text: enriching2
        },
        {
          text: enriching3
        },
        {
          text: enriching4
        },
        {
          text: enriching5 
        },
        {
          text: enriching6
        },
        {
          text: enriching7
        },
        {
          text: enriching8
        },
        {
          text: genReq //user prompt
        }
      ]
    }
  ]
};

userPreviousResponse+=genReq;
const result = await model.generateContentStream(prompt);

// Print text as it comes in.
let fullResponse = '';
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  fullResponse += chunkText; 
  process.stdout.write(chunkText);
}
let cleanedResponse = fullResponse
  .replace(/```json/g, '') // Remove opening code block identifiers
  .replace(/```/g, '')     // Remove closing backticks for code block
  .trim();                 // Trim any leading/trailing spaces

// Remove leading and trailing backticks from the 'content' field
cleanedResponse = cleanedResponse.replace(/"content":\s*`(.*?)`/g, (match, content) => {
  return `"content": ${JSON.stringify(content.trim())}`;
});

// Clean up the string to remove control characters (like newlines, tabs, etc.)
cleanedResponse = cleanedResponse.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
previousResponse=cleanedResponse;
let projectData;
try {
  projectData = JSON.parse(cleanedResponse);
} catch (error) {
  console.error('Error parsing the AI response:', error);
  process.exit(1); // Exit if parsing fails
}

if (!projectData || !Array.isArray(projectData.actions)) {
  console.error('Invalid project structure:', projectData);
  process.exit(1); // Exit if project data is incomplete or malformed
}

// Log file names and their content, and handle commands
const logActions = () => {
  const result = [];
  // Add project name
  if (projectData?.projectName) {
    result.push({ projectName: projectData.projectName });
  }

  // Add file actions
  projectData.actions.forEach(action => {
    if (action.type === 'file') {
      result.push({
        fileName: action.filePath,
        content: action.content,
      });
    } else if (action.type === 'shell') {
      result.push({ command: action.command });
    }
  });

  return result;
};

// Process the actions
forFrontend =  logActions();
console.log(logActions());


app.get('/prompt-from-backend', (req, res) => {
  res.json({ forFrontend }); // Send the variable as JSON
});
}

let modReq = ""
app.post('/modify', async (req, res) => {
  const { Prompt } = req.body;
  modReq = Prompt;  // Update genReq with the user input
  if (!Prompt) {
    return res.status(400).send({ error: 'User prompt is required.' });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    res.json({"content-received": modReq});
    await modifyContent(modReq);
      // Call the function to generate content
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({ error: 'Error generating content' });
    }
  }
});


async function modifyContent(modReq){
  const prompt = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: enriching1 
           },        
          {
            text: enriching2
          },
          {
            text: enriching3
          },
          {
            text: enriching4
          },
          {
            text: enriching5 
          },
          {
            text: enriching6
          },
          {
            text: enriching7
          },
          {
            text: enriching8
          },
          {
            text: `Here's the current project state:\n${previousResponse}\n ALL the previous user responses ${userPreviousResponse}  \nYour task: ${modReq} !!!!!ULTRA IMPORTANT -> do not change the projectName , give new prompt using the same projectName!!!!!!
            !!!ULTRA IMPORTANT -> after making the appropriate changes give the entire project again with all the files in the same order`
          }
        ]
      }
    ]
  };
  
  userPreviousResponse+=modReq;
  const result = await model.generateContentStream(prompt);
  
  // Print text as it comes in.
  let fullResponse = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullResponse += chunkText; 
    process.stdout.write(chunkText);
  }
  let cleanedResponse = fullResponse
    .replace(/```json/g, '') // Remove opening code block identifiers
    .replace(/```/g, '')     // Remove closing backticks for code block
    .trim();                 // Trim any leading/trailing spaces
  
  // Remove leading and trailing backticks from the 'content' field
  cleanedResponse = cleanedResponse.replace(/"content":\s*`(.*?)`/g, (match, content) => {
    return `"content": ${JSON.stringify(content.trim())}`;
  });
  
  // Clean up the string to remove control characters (like newlines, tabs, etc.)
  cleanedResponse = cleanedResponse.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  previousResponse = cleanedResponse;
  let projectData;
  try {
    projectData = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing the AI response:', error);
    process.exit(1); // Exit if parsing fails
  }
  
  if (!projectData || !Array.isArray(projectData.actions)) {
    console.error('Invalid project structure:', projectData);
    process.exit(1); // Exit if project data is incomplete or malformed
  }
  
  // Log file names and their content, and handle commands
  const logActions = () => {
    const result = [];
    // Add project name
    if (projectData?.projectName) {
      result.push({ projectName: projectData.projectName });
    }
  
    // Add file actions
    projectData.actions.forEach(action => {
      if (action.type === 'file') {
        result.push({
          fileName: action.filePath,
          content: action.content,
        });
      } else if (action.type === 'shell') {
        result.push({ command: action.command });
      }
    });
  
    return result;
  };
  // Process the actions
modifyFrontend =  logActions();
console.log(logActions());


app.get('/modPrompt-from-backend', (req, res) => {
  res.json({ modifyFrontend }); // Send the variable as JSON
});
}
  







// let cleanedResponse = fullResponse
//   .replace(/```json/g, '')  // Remove opening code block identifiers
//   .replace(/```/g, '')      // Remove closing backticks for code block
//   .trim();                  // Trim any leading/trailing spaces

// Remove leading and trailing backticks from the 'content' field
// cleanedResponse = cleanedResponse.replace(/"content":\s*`(.*?)`/g, (match, content) => {
//   return `"content": ${JSON.stringify(content.trim())}`;
// });

// // Clean up the string to remove control characters (like newlines, tabs, etc.)
// cleanedResponse = cleanedResponse.replace(/[\x00-\x1F\x7F]/g, '');  // Remove control characters

// let projectData;
// try {
//   projectData = JSON.parse(cleanedResponse);
// } catch (error) {
//   console.error('Error parsing the AI response:', error);
//   process.exit(1);  // Exit if parsing fails
// }

// if (!projectData || !Array.isArray(projectData.actions)) {
//   console.error('Invalid project structure:', projectData);
//   process.exit(1);  // Exit if project data is incomplete or malformed
// }

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const projectDir = path.join(__dirname, projectData.projectName || projectData.name);
// if (!fs.existsSync(projectDir)) {
//   fs.mkdirSync(projectDir, { recursive: true });
// }

// // Function to write each file's content
// const writeFiles = () => {
//   projectData.actions.forEach(action => {
//     if (action.type === 'file') {
//       const filePath = path.join(projectDir, action.filePath);
//       const fileDir = path.dirname(filePath);

//       // Ensure the directory exists
//       if (!fs.existsSync(fileDir)) {
//         fs.mkdirSync(fileDir, { recursive: true });
//       }

//       // Write the content to the file
//       fs.writeFileSync(filePath, action.content);
//       console.log(`File created: ${filePath}`);
//     }
//   });
// };
// // Run the file writing function
// writeFiles();
// previousResponse += cleanedResponse;
// // continueResponse = userPrompt(
// //   "Do you want to make more changes? (yes/no): "
// // ).toLowerCase();
// if(continueResponse=="yes"){
//   while(continueResponse=="yes"){
//   const user = userPrompt("What do you want to modify:");
//   userPreviousResponse+=user;
//   const prompt = {
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             text: "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate,!!ULTRA IMPORANT 'only valid URLs you know exist'. Do not download the images, only link to them in image tags."
//           },        
//           {
//             text: `IMPORTANT: Please do not use backticks (\`) in your responses. Provide plain text or raw JSON/JavaScript without any surrounding code blocks or special characters.
          
//               For example, instead of returning this:
//               \`\`\`json
//               {
//                 "name": "ecommerce-site",
//                 "actions": [
//                   {
//                     "type": "file",
//                     "filePath": "src/App.js",
//                     "content": "\`console.log('Hello World');\`"
//                   }
//                 ]
//               }
//               \`\`\`
          
//               You should return this (no backticks around the content):
//               {
//                 "name": "ecommerce-site",
//                 "actions": [
//                   {
//                     "type": "file",
//                     "filePath": "src/App.js",
//                     "content": "console.log('Hello World');"
//                   }
//                 ]
//               }
          
//               Now, please continue with the original task:
          
//               I want you to respond to my queries in JSON format. The JSON should follow these guidelines:
//               - Provide a well-structured JSON object that matches the requested context.
//               - Include appropriate fields with meaningful keys and values.
//               - Ensure proper nesting and hierarchy if the data requires it.
//               - Avoid adding extra explanations outside the JSON object.
//               - For example, if I ask for details about a project structure, respond like this:
//                 {
//                   "projectName": "example-project", !!!!ULTRA IMPORTANT -> always use "projectName" never use "name"
//                   "actions": [
//                     {
//                       "type": "file",
//                       "filePath": "src/index.js",
//                       "content": "JavaScript content here"
//                     },
//                     {
//                       "type": "shell",
//                       "command": "npm install"
//                     }
//                   ]
//                 }`
//           },
//           {
//             "text": "!!!ULTRA IMPORTANT ->Project Files:\n\nProvide all necessary files and configurations, including:\n\n- A fully functional package.json file with all dependencies and devDependencies.\n- Boilerplate code for a React project (index.html, App.js, index.js, and basic styles like App.css).\n- Configuration files such as vite.config.js or webpack.config.js (if applicable).\n- A .gitignore file."
//           },
//           {
//             text: `Use the ${fetchImage} function to fetch the appropriate image URL based on the user's prompt. 
//             **Guidelines:**
//             1. Analyze the user's prompt and extract a **single word** that best represents the key concept (e.g., "shoe," "hiking," "nature").
//             2. Generate the image URL by calling ${fetchImage} with this word.
//             3. Ensure the URL corresponds to an active image and is in the correct format, like:
//             "https://images.unsplash.com/photo-1618898909019-010e4e234c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODI3ODh8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzMyNjYzMDV8&ixlib=rb-4.0.3&q=80&w=1080"
//             4. Only use image URLs that are **active**. Avoid any links that result in 404 errors. **Verify before using**.
//             5. Call ${fetchImage} **repeatedly** to generate different image URLs wherever image URLs are required in the project.
//             **Example:**
//             - User Prompt: "Sports shoes"
//             - Extracted keyword: "shoe"
//             - Use ${fetchImage('shoe')} to get the image URL.
//             **Important:** Ensure that all URLs are checked before usage to avoid broken links. This is ULTRA IMPORTANT for the functionality of the website.`
//           },
//           {
//             text: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
//           },
//           {
//             text: `use these files ${reactBasePrompt}`
//           },
//           {
//             text: "<bolt_running_commands>\n</bolt_running_commands>\n# File Changes\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json"
//           },
//           // {
//           //   text: `Here's the current project state:\n${previousResponse}\n ALL the previous user responses ${userPreviousResponse}  \nYour task: ${user} !!!!!ULTRA IMPORTANT -> do not change the projectName , give new prompt using the same projectName!!!!!!`,
//           // },
//         ],
//       },
//     ],
//   };
//   const result = await model.generateContentStream(prompt);

// // Print text as it comes in.
// let fullResponse = '';
// for await (const chunk of result.stream) {
//   const chunkText = chunk.text();
//   fullResponse += chunkText;
//   process.stdout.write(chunkText);
// }

// let cleanedResponse = fullResponse
//   .replace(/```json/g, '')  // Remove opening code block identifiers
//   .replace(/```/g, '')      // Remove closing backticks for code block
//   .trim();                  // Trim any leading/trailing spaces

// // Remove leading and trailing backticks from the 'content' field
// cleanedResponse = cleanedResponse.replace(/"content":\s*`(.*?)`/g, (match, content) => {
//   return `"content": ${JSON.stringify(content.trim())}`;
// });

// // Clean up the string to remove control characters (like newlines, tabs, etc.)
// cleanedResponse = cleanedResponse.replace(/[\x00-\x1F\x7F]/g, '');  // Remove control characters

// let projectData;
// try {
//   projectData = JSON.parse(cleanedResponse);
// } catch (error) {
//   console.error('Error parsing the AI response:', error);
//   process.exit(1);  // Exit if parsing fails
// }

// if (!projectData || !Array.isArray(projectData.actions)) {
//   console.error('Invalid project structure:', projectData);
//   process.exit(1);  // Exit if project data is incomplete or malformed
// }

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const projectDir = path.join(__dirname, projectData.projectName || projectData.name);
// if (!fs.existsSync(projectDir)) {
//   fs.mkdirSync(projectDir, { recursive: true });
// }

// // Function to write each file's content
// const writeFiles = () => {
//   projectData.actions.forEach(action => {
//     if (action.type === 'file') {
//       const filePath = path.join(projectDir, action.filePath);
//       const fileDir = path.dirname(filePath);

//       // Ensure the directory exists
//       if (!fs.existsSync(fileDir)) {
//         fs.mkdirSync(fileDir, { recursive: true });
//       }

//       // Write the content to the file
//       fs.writeFileSync(filePath, action.content);
//       console.log(`File created: ${filePath}`);
//     }
//   });
// };
// Run the file writing function
// writeFiles();
// previousResponse += cleanedResponse;
// continueResponse = userPrompt("Do you want to make more changes? (yes/no): ")
// }
// }
// if (continueResponse !== "yes") {
//   console.log("Exiting the loop. Project setup is complete.");
//   break;
// }
// }
// if(continueResponse == "yes"){
// console.log('Next steps:');
// console.log('1. cd ' + projectData.projectName);
// console.log('2. npm install');
// console.log('3. npm run dev');
// }
