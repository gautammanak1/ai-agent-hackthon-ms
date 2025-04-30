const OPENAI_API_KEY = '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';
const API_URL = 'https://api.openai.com/v1/chat/completions';

import { OpenAIMessage, OpenAIRequest, OpenAIResponse, UserProfile, InterviewType } from './types';

/**
 * Send a request to the OpenAI API
 */
export async function sendOpenAIRequest(messages: OpenAIMessage[]): Promise<OpenAIResponse> {
  const request: OpenAIRequest = {
    model: 'gpt-4',
    messages,
    temperature: 0.7,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Generate interview questions based on user profile
 */
export async function generateInterviewQuestions(
  profile: UserProfile, 
  count: number = 5
): Promise<string[]> {
  const prompt = `
    You are an expert interviewer for ${profile.targetRole} positions in the ${profile.industry} industry.
    Generate ${count} challenging and relevant interview questions for a candidate with the following profile:
    
    - Current job title: ${profile.jobTitle}
    - Years of experience: ${profile.yearsOfExperience}
    - Skills: ${profile.skills.join(', ')}
    - Target role: ${profile.targetRole}
    - Interview type: ${profile.interviewType}
    
    Guidelines for questions:
    1. For technical roles:
       - Include system design questions
       - Ask about specific technologies in their skill set
       - Include problem-solving scenarios
       
    2. For behavioral questions:
       - Focus on leadership and team collaboration
       - Include conflict resolution scenarios
       - Ask about project management experience
       
    3. For case studies:
       - Create industry-specific scenarios
       - Include data analysis components
       - Focus on strategic thinking
       
    4. Question structure:
       - Be specific and detailed
       - Avoid yes/no questions
       - Include follow-up components
       - Make questions challenging but appropriate for their experience level
    
    For each question, provide only the question text without numbering or additional commentary.
    Each question should be on a new line and end with a question mark.
  `;

  const messages: OpenAIMessage[] = [
    { 
      role: 'system', 
      content: 'You are an expert technical interviewer with deep knowledge of industry best practices, system design, and modern technology stacks. Generate challenging but fair interview questions that assess both technical depth and practical experience.' 
    },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await sendOpenAIRequest(messages);
    const content = response.choices[0].message.content;
    
    // Extract questions - assuming each question is on a new line
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.endsWith('?'));
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw error;
  }
}

/**
 * Analyze a candidate's response to an interview question
 */
export async function analyzeResponse(
  question: string,
  response: string,
  profile: UserProfile
): Promise<{
  clarity: number;
  confidence: number;
  relevance: number;
  completeness: number;
  technicalAccuracy?: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
}> {
  const prompt = `
    Analyze the following candidate response for a ${profile.targetRole} position.
    
    Question: "${question}"
    Response: "${response}"
    
    Candidate Profile:
    - Target role: ${profile.targetRole}
    - Industry: ${profile.industry}
    - Experience: ${profile.yearsOfExperience} years
    - Skills: ${profile.skills.join(', ')}
    
    Evaluation Criteria:
    1. Clarity (0-100):
       - Clear communication and structure
       - Logical flow of ideas
       - Use of relevant examples
       
    2. Confidence (0-100):
       - Assertiveness in delivery
       - Command of subject matter
       - Professional tone
       
    3. Relevance (0-100):
       - Direct answer to the question
       - Industry-appropriate context
       - Alignment with role requirements
       
    4. Completeness (0-100):
       - Comprehensive coverage
       - Sufficient detail
       - Well-rounded perspective
       
    ${profile.interviewType === InterviewType.TECHNICAL ? `
    5. Technical Accuracy (0-100):
       - Correct technical concepts
       - Appropriate use of terminology
       - Understanding of best practices
    ` : ''}
    
    Provide:
    - Specific strengths (2-3 points)
    - Areas for improvement (2-3 points)
    - Actionable suggestions
    
    Return your analysis as a JSON object with the following structure:
    {
      "clarity": number,
      "confidence": number,
      "relevance": number,
      "completeness": number,
      ${profile.interviewType === InterviewType.TECHNICAL ? '"technicalAccuracy": number,' : ''}
      "strengths": string[],
      "weaknesses": string[],
      "suggestions": string
    }
  `;

  const messages: OpenAIMessage[] = [
    { 
      role: 'system', 
      content: 'You are an expert interview coach that analyzes candidate responses and provides constructive feedback. Return your response as a JSON object without markdown code fences.' 
    },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await sendOpenAIRequest(messages);
    let content = response.choices[0].message.content;
    
    // Handle case where content is wrapped in markdown code fences
    if (content.startsWith('```json')) {
      content = content.substring(7);
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.length - 3);
    }
    content = content.trim();
    
    // Parse the JSON response
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing response:', error);
    throw error;
  }
}

/**
 * Generate a comprehensive interview feedback summary
 */
export async function generateInterviewFeedback(
  profile: UserProfile,
  questions: string[],
  responses: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analyses: any[]
): Promise<{
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  summary: string;
}> {
  // Create a summary of the interview
  let interviewSummary = `Interview Summary:\n`;
  
  for (let i = 0; i < questions.length; i++) {
    interviewSummary += `\nQ${i+1}: ${questions[i]}\n`;
    interviewSummary += `A${i+1}: ${responses[i]}\n`;
    
    if (analyses[i]) {
      interviewSummary += `Analysis: Clarity: ${analyses[i].clarity}, Confidence: ${analyses[i].confidence}, ` +
        `Relevance: ${analyses[i].relevance}, Completeness: ${analyses[i].completeness}\n`;
    }
  }

  const prompt = `
    Generate comprehensive feedback for a ${profile.targetRole} interview candidate.
    
    Candidate Profile:
    - Target role: ${profile.targetRole}
    - Industry: ${profile.industry}
    - Experience: ${profile.yearsOfExperience} years
    - Skills: ${profile.skills.join(', ')}
    
    ${interviewSummary}
    
    Evaluation Guidelines:
    1. Overall Score (0-100):
       - Consider response quality across all questions
       - Weight technical accuracy heavily for technical roles
       - Account for experience level expectations
       
    2. Key Strengths:
       - Identify consistent positive patterns
       - Highlight standout responses
       - Note professional competencies
       
    3. Areas for Improvement:
       - Identify skill gaps
       - Note communication issues
       - Suggest specific growth areas
       
    4. Recommendations:
       - Provide actionable next steps
       - Suggest learning resources
       - Include practice strategies
       
    5. Summary:
       - Overall performance assessment
       - Readiness for target role
       - Growth trajectory
    
    Return your feedback as a JSON object with the following structure:
    {
      "overallScore": number,
      "strengths": string[],
      "areasForImprovement": string[],
      "recommendations": string[],
      "summary": string
    }
  `;

  const messages: OpenAIMessage[] = [
    { 
      role: 'system', 
      content: 'You are an expert interview coach that provides comprehensive feedback to help candidates improve. Return your response as a JSON object without markdown code fences.' 
    },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await sendOpenAIRequest(messages);
    let content = response.choices[0].message.content;
    
    // Handle case where content is wrapped in markdown code fences
    if (content.startsWith('```json')) {
      content = content.substring(7);
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.length - 3);
    }
    content = content.trim();
    
    // Parse the JSON response
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating interview feedback:', error);
    throw error;
  }
}