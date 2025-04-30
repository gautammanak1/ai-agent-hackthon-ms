// lib/customizedcv.ts
import { AzureOpenAI } from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = "2024-04-01-preview";
const model = "gpt-35-turbo";

const client = new AzureOpenAI({
  endpoint,
  apiKey,
  deployment,
  apiVersion,
});

export async function generateCustomResume(jobDescription: string): Promise<string> {

  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a professional resume writer who crafts resumes tailored to job descriptions.",
      },
      {
        role: "user",
        content: jobDescription   
      },
    ],
    model: model,
    max_tokens: 3000,
    temperature: 0.7,
    top_p: 1,
  });

  return response.choices[0].message.content!;
}

  
