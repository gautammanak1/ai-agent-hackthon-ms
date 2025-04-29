import { getJobRecommendations } from '@/lib/resume-analyzer';
import { Configuration, OpenAIApi } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText || resumeText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Resume text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const prompt = `
      You are an expert ATS and resume analyzer. Analyze the following resume and provide a detailed assessment as a JSON object that strictly follows this TypeScript interface:

      interface AnalysisResultType {
        atsScore: number;
        formatScore: number;
        keywordCount: number;
        yearsOfExperience: number;
        educationLevel: string;
        jobMatchScore: number;
        skills: string[];
        scoreBreakdown: {
          category: string;
          score: number;
          description: string;
        }[];
        improvementSuggestions: {
          title: string;
          description: string;
          section: string;
          priority: "high" | "medium" | "low";
          examples?: string[];
        }[];
        jobRecommendations: {
          id: number;
          title: string;
          company: string;
          location: string;
          description: string;
          matchPercentage: number;
          skills: string[];
        }[];
      }

      Resume:
      ${resumeText}

      Instructions:
      - Return the response as a valid JSON object wrapped in a markdown code block (e.g., \`\`\`json\n{...}\n\`\`\`).
      - Estimate the ATS compatibility score (0-100) based on keyword usage, formatting, and clarity.
      - Calculate the format score (0-100) based on structure, readability, and organization.
      - Count relevant keywords related to the job field (e.g., technical skills, tools, certifications).
      - Estimate years of experience based on work history.
      - Identify the highest education level (e.g., "High School", "Bachelor's", "Master's", "PhD").
      - Assign a job match score (0-100) based on skills and experience alignment with typical software engineering roles.
      - List all detected skills (e.g., programming languages, frameworks, soft skills).
      - Provide a score breakdown for categories like "Content", "Structure", and "Keywords".
      - Suggest at least 3 improvements with priority levels and specific examples where applicable.
      - Include at least 3 job recommendations with placeholder data (to be replaced later).
      - If any field cannot be determined, use reasonable defaults (e.g., 0 for scores, empty arrays for lists).
      - Ensure the response is concise but complete.

      Example response:
      \`\`\`json
      {
        "atsScore": 85,
        "formatScore": 90,
        "keywordCount": 15,
        "yearsOfExperience": 3,
        "educationLevel": "Bachelor's",
        "jobMatchScore": 80,
        "skills": ["JavaScript", "Python", "React"],
        "scoreBreakdown": [
          {"category": "Content", "score": 85, "description": "Good detail in experience"},
          {"category": "Structure", "score": 90, "description": "Clear sections"},
          {"category": "Keywords", "score": 80, "description": "Relevant technical terms"}
        ],
        "improvementSuggestions": [
          {
            "title": "Add Quantifiable Achievements",
            "description": "Include metrics in experience section",
            "section": "Experience",
            "priority": "high",
            "examples": ["Increased performance by 20%"]
          },
          {
            "title": "Use Action Verbs",
            "description": "Start bullet points with strong action verbs",
            "section": "Experience",
            "priority": "medium",
            "examples": ["Developed", "Led", "Optimized"]
          },
          {
            "title": "Add Certifications",
            "description": "Include relevant certifications to boost credibility",
            "section": "Education",
            "priority": "low"
          }
        ],
        "jobRecommendations": [
          {
            "id": 1,
            "title": "Software Engineer",
            "company": "Tech Corp",
            "location": "Remote",
            "description": "Develop web applications",
            "matchPercentage": 85,
            "skills": ["JavaScript", "Python"]
          },
          {
            "id": 2,
            "title": "Frontend Developer",
            "company": "Web Solutions",
            "location": "San Francisco, CA",
            "description": "Build responsive web interfaces",
            "matchPercentage": 80,
            "skills": ["React", "JavaScript"]
          },
          {
            "id": 3,
            "title": "Full Stack Developer",
            "company": "Innovate Tech",
            "location": "New York, NY",
            "description": "Work on end-to-end web development",
            "matchPercentage": 75,
            "skills": ["Python", "React"]
          }
        ]
      }
      \`\`\`
    `;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert ATS and resume analyzer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI Response:', data);

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid OpenAI response structure');
    }

    let analysisResult;
    try {
      // Extract JSON from markdown code block (if present)
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response Content:', data.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response');
    }

    // Fetch job recommendations using getJobRecommendations
    const jobTitle = analysisResult.skills[0] || 'software developer';
    try {
      const jobData = await getJobRecommendations(jobTitle);
      analysisResult.jobRecommendations = jobData.data.map((job: any, index: number) => ({
        id: index + 1,
        title: job.job_title || 'Software Developer',
        company: job.employer_name || 'Tech Company',
        location: job.location || 'Remote',
        description: job.job_description || 'Position available for experienced professional',
        matchPercentage: Math.floor(Math.random() * 30) + 70,
        skills: analysisResult.skills.slice(0, 5)
      }));
    } catch (jobError) {
      console.warn('RapidAPI job search failed:', jobError);
      analysisResult.jobRecommendations = analysisResult.jobRecommendations || [];
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in resume analysis:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Failed to analyze resume' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}