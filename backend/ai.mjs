import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import authenticate from "./middleware.mjs";
import {
  mobileEnriching1,
  mobileEnriching2,
  mobileEnriching3,
  mobileEnriching4,
  sysPromptMobile,
} from "./prompt-mobile.mjs";
import {
  sysPrompt,
  webEnriching1,
  webEnriching2,
  webEnriching3,
  webEnriching4,
  webEnriching5,
  webEnriching6,
  webEnriching7,
  webEnriching8,
} from "./prompt.mjs";
import multer from "multer";
import axios from "axios";

const app = express();
const upload = multer();
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.raw({ type: "application/zip", limit: "50mb" }));

const schema = {
  description: "React project structure with files",
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
            description:
              "Relative path to the file including filename and extension",
            nullable: false,
          },
          content: {
            type: SchemaType.STRING,
            description: "The complete content of the file",
            nullable: false,
          },
        },
        required: ["type", "filePath", "content"],
      },
    },
  },
  required: ["projectName", "actions"],
};

const genAI = new GoogleGenerativeAI(process.env.api_key);

//<--------------------------------- WEB ENDPOINTS -------------------------------------------->

app.post("/generate", authenticate, async (req, res) => {
  const { Prompt } = req.body;

  if (!Prompt) {
    return res.status(400).send({ error: "User prompt is required." });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    const forFrontend = await generateContent(Prompt);

    res.json({ forFrontend });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({ error: "Error generating content" });
    }
  }
});

async function generateContent(genReq) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: sysPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: webEnriching1,
          },
          {
            text: webEnriching2,
          },
          {
            text: webEnriching3,
          },
          {
            text: webEnriching4,
          },
          {
            text: webEnriching5,
          },
          {
            text: webEnriching6,
          },
          {
            text: webEnriching7,
          },
          {
            text: webEnriching8,
          },
          {
            text: genReq, //user prompt
          },
        ],
      },
    ],
  };

  const result = await model.generateContent(prompt);
  console.log(result.response.text());

  let data = result.response.text();
  let projectData;
  try {
    projectData = JSON.parse(data);
  } catch (error) {
    console.error("Error parsing the AI response:", error);
  }

  if (!projectData || !Array.isArray(projectData.actions)) {
    console.error("Invalid project structure:", projectData);
  }

  // Log file names and their content, and handle commands
  const logActions = () => {
    const result = [];
    // Add project name
    if (projectData?.projectName) {
      result.push({ projectName: projectData.projectName });
    }

    // Add file actions
    projectData.actions.forEach((action) => {
      if (action.type === "file") {
        result.push({
          fileName: action.filePath,
          content: action.content,
        });
      } else if (action.type === "shell") {
        result.push({ command: action.command });
      }
    });

    return result;
  };

  return logActions();
}

app.post("/modify", authenticate, async (req, res) => {
  const { Prompt, prevRes } = req.body;
  if (!Prompt) {
    return res.status(400).send({ error: "User prompt is required." });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    const modifyFrontend = await modifyContent(Prompt, prevRes);
    res.json({ modifyFrontend });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({ error: "Error generating content" });
    }
  }
});

async function modifyContent(modReq, previousResponse) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: sysPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: webEnriching1,
          },
          {
            text: webEnriching2,
          },
          {
            text: webEnriching3,
          },
          {
            text: webEnriching4,
          },
          {
            text: webEnriching5,
          },
          {
            text: webEnriching6,
          },
          {
            text: webEnriching7,
          },
          {
            text: webEnriching8,
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
             </ULTRA IMPORTANT> !!!!!!!!!!!!!`,
          },
        ],
      },
    ],
  };

  const result = await model.generateContentStream(prompt);

  // Print text as it comes in.
  let fullResponse = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullResponse += chunkText;
    process.stdout.write(chunkText);
  }
  let cleanedResponse = fullResponse
    .replace(/```json/g, "") // Remove opening code block identifiers
    .replace(/```/g, "") // Remove closing backticks for code block
    .trim(); // Trim any leading/trailing spaces

  // Remove leading and trailing backticks from the 'content' field
  cleanedResponse = cleanedResponse.replace(
    /"content":\s*`(.*?)`/g,
    (match, content) => {
      return `"content": ${JSON.stringify(content.trim())}`;
    }
  );

  // Clean up the string to remove control characters (like newlines, tabs, etc.)
  cleanedResponse = cleanedResponse.replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
  let projectData;
  try {
    projectData = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error parsing the AI response:", error);
  }

  if (!projectData || !Array.isArray(projectData.actions)) {
    console.error("Invalid project structure:", projectData);
  }

  // Log file names and their content, and handle commands
  const logActions = () => {
    const result = [];
    // Add project name
    if (projectData?.projectName) {
      result.push({ projectName: projectData.projectName });
    }

    // Add file actions
    projectData.actions.forEach((action) => {
      if (action.type === "file") {
        result.push({
          fileName: action.filePath,
          content: action.content,
        });
      } else if (action.type === "shell") {
        result.push({ command: action.command });
      }
    });

    return result;
  };

  return logActions();
}

//<---------------------------------Hosting ENDPOINTS -------------------------------------------->

app.post(
  "/site/deploy",
  upload.single("file"),
  authenticate,
  async (req, res) => {
    try {
      const blob = req.file.buffer;
      const { title } = req.body;

      const createSite = await axios.post(
        "https://api.netlify.com/api/v1/sites",
        { name: `Phantom-${title}` },
        {
          headers: {
            Authorization: `Bearer ${process.env.NETLIFY_PAT}`,
          },
        }
      );

      const result = await axios.put(
        `https://api.netlify.com/api/v1/sites/${createSite.data.id}`,
        blob,
        {
          headers: {
            Authorization: `Bearer ${process.env.NETLIFY_PAT}`,
            "Content-Type": "application/zip",
          },
        }
      );
      res.json({ ...result.data });
    } catch (error) {
      console.log("Deploy error:", error);
      res.status(500).json({ error: "Deployment failed" });
    }
  }
);

app.post(
  "/site/update",
  upload.single("file"),
  authenticate,
  async (req, res) => {
    try {
      const blob = req.file.buffer;
      const { hostingID } = req.body;

      const result = await axios.put(
        `https://api.netlify.com/api/v1/sites/${hostingID}`,
        blob,
        {
          headers: {
            Authorization: `Bearer ${process.env.NETLIFY_PAT}`,
            "Content-Type": "application/zip",
          },
        }
      );
      res.json({ ...result.data });
    } catch (error) {
      console.log("Update error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  }
);

app.post("/site/delete", authenticate, async (req, res) => {
  try {
    const { hostingID } = req.body;

    if (!hostingID) {
      return res.status(400).json({ error: "hostingId is required" });
    }

    const result = await axios.delete(
      `https://api.netlify.com/api/v1/sites/${hostingID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NETLIFY_PAT}`,
        },
      }
    );
    console.log(result.status);
    console.log(result.data);
    if (result.status === 200 || result.status === 204) {
      return res.sendStatus(200);
    } else {
      return res.status(result.status).json({ error: "Failed to delete site" });
    }
  } catch (e) {
    console.error("Delete error:", e?.response?.data || e.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//<---------------------------------MOBILE ENDPOINTS -------------------------------------------->

app.post("/generate-mobile", authenticate, async (req, res) => {
  const { Prompt } = req.body;

  if (!Prompt) {
    return res.status(400).send({ error: "User prompt is required." });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    const forFrontend = await generateContentMobile(Prompt);

    res.json({ forFrontend });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({ error: "Error generating content" });
    }
  }
});

async function generateContentMobile(genReq) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: sysPromptMobile,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: mobileEnriching1,
          },
          {
            text: mobileEnriching2,
          },
          {
            text: mobileEnriching3,
          },
          {
            text: mobileEnriching4,
          },
          {
            text: genReq, //user prompt
          },
        ],
      },
    ],
  };

  const result = await model.generateContent(prompt);
  console.log(result.response.text());

  let data = result.response.text();
  let projectData;
  try {
    projectData = JSON.parse(data);
  } catch (error) {
    console.error("Error parsing the AI response:", error);
  }

  if (!projectData || !Array.isArray(projectData.actions)) {
    console.error("Invalid project structure:", projectData);
  }

  // Log file names and their content, and handle commands
  const logActions = () => {
    const result = [];
    // Add project name
    if (projectData?.projectName) {
      result.push({ projectName: projectData.projectName });
    }

    // Add file actions
    projectData.actions.forEach((action) => {
      if (action.type === "file") {
        result.push({
          fileName: action.filePath,
          content: action.content,
        });
      } else if (action.type === "shell") {
        result.push({ command: action.command });
      }
    });

    return result;
  };

  return logActions();
}

app.post("/modify-mobile", authenticate, async (req, res) => {
  const { Prompt, prevRes } = req.body;
  if (!Prompt) {
    return res.status(400).send({ error: "User prompt is required." });
  }
  // After receiving the prompt, run the logic that needs to be executed
  try {
    const modifyFrontend = await modifyContentMobile(Prompt, prevRes);
    res.json({ modifyFrontend });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({ error: "Error generating content" });
    }
  }
});

async function modifyContentMobile(modReq, previousResponse) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: sysPromptMobile,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: mobileEnriching1,
          },
          {
            text: mobileEnriching2,
          },
          {
            text: mobileEnriching3,
          },
          {
            text: mobileEnriching4,
          },
          {
            text: `Here's the current project state:\n${previousResponse}\n\nYour task: ${modReq} !!!!!ULTRA IMPORTANT -> do not change the projectName , give new prompt using the same projectName!!!!!!
            !!!<ULTRA IMPORTANT> -> after making the appropriate changes give all the files except these
            - **package-lock.json**
            - **babel.config.js**
            - **app.json**
            - **tsconfig.json**
            !!!!! give these files only if they were modifed , if not modified then dont give them in the response!!!!!!!
             </ULTRA IMPORTANT> !!!!!!!!!!!!!`,
          },
        ],
      },
    ],
  };

  const result = await model.generateContentStream(prompt);

  // Print text as it comes in.
  let fullResponse = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullResponse += chunkText;
    process.stdout.write(chunkText);
  }
  let cleanedResponse = fullResponse
    .replace(/```json/g, "") // Remove opening code block identifiers
    .replace(/```/g, "") // Remove closing backticks for code block
    .trim(); // Trim any leading/trailing spaces

  // Remove leading and trailing backticks from the 'content' field
  cleanedResponse = cleanedResponse.replace(
    /"content":\s*`(.*?)`/g,
    (match, content) => {
      return `"content": ${JSON.stringify(content.trim())}`;
    }
  );

  // Clean up the string to remove control characters (like newlines, tabs, etc.)
  cleanedResponse = cleanedResponse.replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
  let projectData;
  try {
    projectData = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error parsing the AI response:", error);
  }

  if (!projectData || !Array.isArray(projectData.actions)) {
    console.error("Invalid project structure:", projectData);
  }

  // Log file names and their content, and handle commands
  const logActions = () => {
    const result = [];
    // Add project name
    if (projectData?.projectName) {
      result.push({ projectName: projectData.projectName });
    }

    // Add file actions
    projectData.actions.forEach((action) => {
      if (action.type === "file") {
        result.push({
          fileName: action.filePath,
          content: action.content,
        });
      } else if (action.type === "shell") {
        result.push({ command: action.command });
      }
    });

    return result;
  };

  return logActions();
}
