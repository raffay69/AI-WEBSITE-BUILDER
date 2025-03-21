/*
Run this model in Javascript

> npm install openai
*/
import OpenAI from "openai";
import { system } from "./optimalPrompts.mjs";

// To authenticate with the model you will need to generate a personal access token (PAT) in your GitHub settings. 
// Create your PAT token by following instructions here: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
const token = "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";

export async function main() {

  const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: token
  });

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: system },
      { role:"user", content: "Create a fully functional and visually appealing To-Do app using Next.js, TypeScript, and TailwindCSS. The app should heavily utilize ShadCN UI components for a modern, interactive experience. Implement the following features:" }
    ],
    model: "gpt-4o",
    functions: [
        {
          name: "get_project_structure",
          description: "Generates a Next.js project structure with files",
          parameters: {
            type: "object",
            properties: {
              projectName: {
                type: "string",
                description: "Name of the project"
              },
              actions: {
                type: "array",
                description: "List of file actions to create the project structure",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      description: "Type of action (file)"
                    },
                    filePath: {
                      type: "string",
                      description: "Relative path to the file including filename and extension"
                    },
                    content: {
                      type: "string",
                      description: "The complete content of the file"
                    }
                  },
                  required: ["type", "filePath", "content"]
                }
              }
            },
            required: ["projectName", "actions"]
          }
        }
      ],
      function_call: "auto"
  });

  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
