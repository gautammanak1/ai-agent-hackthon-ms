"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Roadmap } from "@/types/roadmap"

interface RoadmapParams {
  category: "education" | "software"
  topic: string
  currentLevel: "beginner" | "intermediate" | "advanced"
  goals: string
  timeframe: "1month" | "3months" | "6months" | "1year"
}

export async function generateRoadmap(params: RoadmapParams): Promise<Roadmap> {
  try {
    const timeframeMap = {
      "1month": "1 month",
      "3months": "3 months",
      "6months": "6 months",
      "1year": "1 year",
    }

    const prompt = `
  Create a detailed learning roadmap for ${params.category === "education" ? "education" : "software development"} 
  on the topic of "${params.topic}". The user is at a ${params.currentLevel} level and has the following goals: 
  "${params.goals}". The timeframe for this roadmap is ${timeframeMap[params.timeframe]}.
  
  Format the response as a JSON object with the following structure:
  {
    "title": "Title of the roadmap",
    "description": "Brief description of the roadmap",
    "milestones": [
      {
        "title": "Milestone title",
        "type": "learning|project|concept|assessment",
        "description": "Description of the milestone",
        "duration": "Estimated time to complete",
        "tasks": ["Task 1", "Task 2", "Task 3"]
      }
    ],
    "resources": [
      {
        "title": "Resource title",
        "type": "book|video|course|website|repository|tutorial|youtube|podcast",
        "description": "Description of the resource",
        "url": "URL to the resource (if applicable)",
        "level": "beginner|intermediate|advanced",
        "tags": ["tag1", "tag2"]
      }
    ]
  }
  
  IMPORTANT GUIDELINES FOR RESOURCES:
  1. Provide SPECIFIC, REAL resources with actual titles, authors, and URLs when possible
  2. For books, include author names and publication years
  3. For courses, include the platform (Coursera, Udemy, etc.) and instructor names
  4. For websites and repositories, provide actual URLs to well-known, reputable sites
  5. Include at least 10-15 high-quality resources across different types
  6. Ensure resources are appropriate for the user's current level
  7. Include both free and paid options, clearly labeled
  8. For software development topics, include official documentation and GitHub repositories
  
  Ensure the milestones are sequential and build upon each other. Include a mix of learning activities, 
  projects, and assessments. Make sure the roadmap is realistic for the given timeframe and current level.
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 2500,
    })

    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse roadmap JSON from response")
    }

    const roadmapData = JSON.parse(jsonMatch[0])
    return roadmapData as Roadmap
  } catch (error) {
    console.error("Error generating roadmap:", error)
    throw new Error("Failed to generate roadmap. Please try again.")
  }
}
