"use server";

import type { Roadmap } from "@/types/roadmap";

// Hardcoded Azure Open AI configuration
const AZURE_OPENAI_API_KEY = "8pBE70i7j9rjTmzcjstAacUm9kMAjPYQtIgp77QiRuHhoFRMD1TMJQQJ99BDACYeBjFXJ3w3AAABACOGh0ei";
const AZURE_OPENAI_ENDPOINT = "https://career-pilot-openai.openai.azure.com/";
const AZURE_OPENAI_DEPLOYMENT = "gpt-35-turbo"; // Switch to "gpt-4" if available in your Azure instance
const API_URL = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-05-15`;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Delay utility for retries
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send a request to the Azure Open AI API
 */
async function sendAzureRequest(prompt: string, retries: number = MAX_RETRIES): Promise<string> {
  const request = {
    messages: [
      {
        role: "system",
        content: "You are an expert in creating detailed, structured learning roadmaps for education and software development. Provide responses in JSON format, ensuring accuracy, specificity, and relevance. Include specific, real-world resources, including YouTube videos, with URLs, authors, and clear descriptions.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 3000, // Increased to accommodate detailed resources
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure Open AI API request failed: ${response.status} ${errorText}`);
      if (response.status === 429 && retries > 0) {
        await delay(RETRY_DELAY);
        return sendAzureRequest(prompt, retries - 1);
      }
      throw new Error(`Azure Open AI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return sendAzureRequest(prompt, retries - 1);
    }
    console.error("Error calling Azure Open AI API:", error);
    throw error;
  }
}

interface RoadmapParams {
  category: "education" | "software";
  topic: string;
  currentLevel: "beginner" | "intermediate" | "advanced";
  goals: string;
  timeframe: "1month" | "3months" | "6months" | "1year";
}

export async function generateRoadmap(params: RoadmapParams): Promise<Roadmap> {
  try {
    const timeframeMap = {
      "1month": "1 month",
      "3months": "3 months",
      "6months": "6 months",
      "1year": "1 year",
    };

    const prompt = `
Create a detailed learning roadmap for ${params.category === "education" ? "education" : "software development"} 
on the topic of "${params.topic}". The user is at a ${params.currentLevel} level and has the following goals: 
"${params.goals}". The timeframe for this roadmap is ${timeframeMap[params.timeframe]}.

Format the response as a JSON object with the following structure:
{
  "title": "Title of the roadmap",
  "description": "Brief description of the roadmap, including its purpose and expected outcomes",
  "milestones": [
    {
      "title": "Milestone title",
      "type": "learning|project|concept|assessment",
      "description": "Detailed description of the milestone, including learning objectives",
      "duration": "Estimated time to complete (e.g., '1 week', '2 weeks')",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"]
    }
  ],
  "resources": [
    {
      "title": "Resource title",
      "type": "book|video|course|website|repository|tutorial|youtube|podcast",
      "description": "Detailed description of the resource, including why it’s relevant",
      "url": "Direct URL to the resource (required for all except books)",
      "level": "beginner|intermediate|advanced",
      "tags": ["tag1", "tag2"],
      "cost": "free|paid"
    }
  ]
}

**Roadmap Guidelines**:
1. **Milestones**: Create 4-8 sequential milestones that build on each other, covering the entire timeframe. Include a mix of:
   - **Learning**: Studying concepts or tools.
   - **Projects**: Practical applications (e.g., building a small app for software topics).
   - **Concepts**: Deep dives into key theories or frameworks.
   - **Assessments**: Quizzes, coding challenges, or self-evaluations.
2. **Tasks**: Each milestone should have 3-5 specific, actionable tasks tailored to the user’s level and goals.
3. **Learning Content Model (LCM)**: Ensure the roadmap follows a structured learning progression:
   - Start with foundational knowledge (for beginners) or advanced concepts (for intermediate/advanced).
   - Include scaffolding (e.g., simpler tasks early, complex projects later).
   - Incorporate assessments to measure progress.
4. **Realism**: Ensure the roadmap is achievable within the timeframe, considering the user’s current level.

**Resource Guidelines**:
1. Provide **12-15 high-quality, specific resources** covering:
   - **YouTube Videos**: At least 3-5 videos from reputable channels (e.g., freeCodeCamp, Traversy Media, The Net Ninja for software; Khan Academy, CrashCourse for education). Include video titles, channel names, and direct URLs.
   - **Books**: 2-3 books with author names, publication years, and ISBNs (if applicable).
   - **Courses**: 2-3 online courses from platforms like Coursera, Udemy, or Pluralsight, with instructor names and URLs.
   - **Websites**: Official documentation, tutorials, or blogs (e.g., MDN Web Docs, React.dev for software).
   - **Repositories**: GitHub repositories with relevant code or projects.
   - **Podcasts/Tutorials**: Relevant audio or written content.
2. Ensure resources are:
   - **Specific**: Include exact titles, authors, and URLs (except for books, where ISBN or publisher is sufficient).
   - **Level-Appropriate**: Match the user’s current level.
   - **Diverse**: Mix free and paid options, clearly labeled with "cost" field.
   - **Reputable**: Use well-known, reliable sources.
3. For software development topics, prioritize:
   - Official documentation Bruijn et al., 2023).
   - GitHub repositories with practical examples.
   - YouTube tutorials with hands-on coding.

**Example for Software (React, Beginner)**:
- YouTube: "React Tutorial for Beginners" by freeCodeCamp (https://www.youtube.com/watch?v=SqcY0GlETPk).
- Book: "Learning React" by Alex Banks and Eve Porcello (2020).
- Course: "React - The Complete Guide" by Maximilian Schwarzmüller on Udemy (URL).
- Website: React Official Documentation (https://react.dev).
- Repository: Example React project on GitHub (URL).

Ensure the roadmap is engaging, practical, and motivating, with clear steps to achieve the user’s goals.
`;

    const text = await sendAzureRequest(prompt);

    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse roadmap JSON from response");
    }

    const roadmapData = JSON.parse(jsonMatch[0]);
    return roadmapData as Roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw new Error("Failed to generate roadmap. Please try again.");
  }
}