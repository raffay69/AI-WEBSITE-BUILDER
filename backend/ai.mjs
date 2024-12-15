import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';
import bodyParser from 'body-parser';
import { enriching1, enriching2, enriching3, enriching4, enriching5, enriching6, enriching7, enriching8, sysPrompt } from "./prompt.mjs";
import cors from 'cors'
import 'dotenv/config';




const app = express();
app.use(cors());
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());


const genAI = new GoogleGenerativeAI(process.env.api_key);
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
    res.json(`prompt received ${genReq}`);
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