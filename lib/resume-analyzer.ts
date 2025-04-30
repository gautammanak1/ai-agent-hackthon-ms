import { type AnalysisResultType } from "./types";

export async function analyzeResume(resumeText: string): Promise<AnalysisResultType> {
  try {
    const response = await fetch('/api/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze resume');
    }

    return data as AnalysisResultType;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

export async function getJobRecommendations(jobTitle: string, location: string = 'united states') {
  try {
    const url = `https://jsearch.p.rapidapi.com/estimated-salary?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}&location_type=ANY&years_of_experience=ALL`;
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'd3440a70b0msh4af35b9f69e8ca8p10f887jsnf7f2de43fb2f',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch job recommendations');
    }

    return data || { data: [] }; // Fallback to empty array if data is null
  } catch (error) {
    console.error('Error fetching job recommendations:', error);
    throw error;
  }
}