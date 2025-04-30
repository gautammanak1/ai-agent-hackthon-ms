import { NextResponse } from 'next/server';
import { generateResumeContent } from '@/lib/customizedcv';

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const prompt = `
      Based on the following job description, generate a customized resume with these sections:
      - Professional Summary
      - Experience
      - Skills
      - Contact Information
      - References
      - Certifications
      
      Keep formatting clean and suitable for export as PDF.
      
      Job Description:
      ${jobDescription}
    `;

    const resume = await generateResumeContent(prompt);
    return NextResponse.json({ resume });

  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: 'Failed to generate resume' }, { status: 500 });
  }
}





