import { GoogleGenerativeAI ,SchemaType } from "@google/generative-ai";
import express from 'express';
import bodyParser from 'body-parser';
import { enriching1, enriching2, enriching3, enriching4, enriching5, enriching6, enriching7, enriching8 } from "./prompt.mjs";

import cors from 'cors'
import 'dotenv/config';
import authenticate from "./middleware.mjs";
import { preFeed } from "./preFeed.mjs";
import { system } from "./optimalPrompts.mjs";
import { sysPrompt } from "./prompt.mjs";




const app = express();
app.use(cors());
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const schema = {
  description: "Next.js project structure with files",
  type: SchemaType.OBJECT,
  properties: {
    projectName: {
      type: SchemaType.STRING,
      description: "Name of the project",
      nullable: false,
    },
    actions: {
      type: SchemaType.ARRAY,
      description: "List of file actions to create the project structure",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            description: "Type of action (file)",
            nullable: false,
          },
          filePath: {
            type: SchemaType.STRING,
            description: "Relative path to the file including filename and extension",
            nullable: false,
          },
          content: {
            type: SchemaType.STRING,
            description: "The complete content of the file",
            nullable: false,
          }
        },
        required: ["type", "filePath", "content"],
      }
    }
  },
  required: ["projectName", "actions"],
};

const genAI = new GoogleGenerativeAI(process.env.api_key);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: sysPrompt, 
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  }, 
  });
// let previousResponse = null;
// let userPreviousResponse = "";


app.post('/generate', authenticate, async (req, res) => {
  const { Prompt } = req.body;

  if (!Prompt) {
    return res.status(400).send({ error: 'User prompt is required.' });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    const forFrontend = await generateContent(Prompt);
    
    // forFrontend.push(...preFeed)				

    res.json({forFrontend});
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
          text: genReq  //user prompt
        }
      ]
    }
  ]
};

// userPreviousResponse+=genReq;
const result = await model.generateContent(prompt);
// console.log(result.response.candidates[0].content.parts[1].text);
console.log(result.response.text())

// Print text as it comes in.
// let fullResponse = result.response.candidates[0].content.parts[1].text;
let data = result.response.text();
// for await (const chunk of result.stream) {
//   const chunkText = chunk.text();
//   fullResponse += chunkText; 
//   process.stdout.write(chunkText);
// }

// const jsonMatch = fullResponse.match(/(\{[\s\S]*\})/);
// const jsonString = jsonMatch ? jsonMatch[0] : fullResponse;

let projectData;
try {
  projectData = JSON.parse(data);
} catch (error) {
  console.error('Error parsing the AI response:', error);
  // process.exit(1); // Exit if parsing fails
  // if (error instanceof SyntaxError) {
  //   const position = error.message.match(/at position (\d+)/);
  //   if (position) {
  //       const errorPosition = parseInt(position[1], 10);
  //       const errorSnippet = cleanedResponse.slice(errorPosition - 150, errorPosition + 150); // Get 50 characters before and after the error position
  //       console.error("JSON parsing error at position:", errorPosition);
  //       console.error("Error snippet:", errorSnippet);
  //     }
  //   }
  //   const fixedString = cleanedResponse.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
  //   return projectData = JSON.parse(fixedString);
  }

if (!projectData || !Array.isArray(projectData.actions)) {
  console.error('Invalid project structure:', projectData);
  // process.exit(1); // Exit if project data is incomplete or malformed
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
// forFrontend =  logActions();
// console.log(logActions());
return logActions();

// app.get('/prompt-from-backend', (req, res) => {
//   res.json({ forFrontend }); // Send the variable as JSON
// });
}

app.post('/modify',authenticate, async (req, res) => {
  const { Prompt , prevRes } = req.body;
  if (!Prompt) {
    return res.status(400).send({ error: 'User prompt is required.' });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    // res.json({"content-received": modReq});
   const modifyFrontend =  await modifyContent(Prompt , prevRes);
    res.json({modifyFrontend}); 
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({ error: 'Error generating content' });
    }
  }
});


async function modifyContent(modReq , previousResponse){
  
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
            text: `Here's the current project state:\n${previousResponse}\n\nYour task: ${modReq} !!!!!ULTRA IMPORTANT -> do not change the projectName , give new prompt using the same projectName!!!!!!
            !!!<ULTRA IMPORTANT> -> after making the appropriate changes give all the files except these
            - **eslint.config.js**
            - **package-lock.json**
            - **postcss.config.js**
            - **tailwind.config.js**
            - **tsconfig.app.json**
            - **tsconfig.json**
            - **tsconfig.node.json**
            - **vite.config.ts** 
            !!!!! give these files only if they were modifed , if not modified then dont give them in the response!!!!!!!
             </ULTRA IMPORTANT> !!!!!!!!!!!!!`
          }
        ]
      }
    ]
  };
  
  // userPreviousResponse+=modReq;
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
  // previousResponse = cleanedResponse;
  let projectData;
  try {
    projectData = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing the AI response:', error);
    // process.exit(1); // Exit if parsing fails
  }
  
  if (!projectData || !Array.isArray(projectData.actions)) {
    console.error('Invalid project structure:', projectData);
    // process.exit(1); // Exit if project data is incomplete or malformed
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
// modifyFrontend =  logActions();
// console.log(logActions());

return logActions();
// app.get('/modPrompt-from-backend', (req, res) => {
//   res.json({ modifyFrontend }); // Send the variable as JSON
// });
}