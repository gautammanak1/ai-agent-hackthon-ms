export interface ScoreBreakdown {
  category: string;
  score: number;
  description: string;
}

export interface ImprovementSuggestion {
  title: string;
  description: string;
  section: string;
  priority: "high" | "medium" | "low";
  examples?: string[];
}

export interface JobRecommendation {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  matchPercentage: number;
  skills: string[];
  link?: string;
  salary?: {
    min: number;
    median: number;
    max: number;
  };
  sourceLink?: string;
}

export interface AnalysisResultType {
  atsScore: number;
  formatScore: number;
  keywordCount: number;
  yearsOfExperience: number;
  educationLevel: string;
  jobMatchScore: number;
  skills: string[];
  scoreBreakdown: ScoreBreakdown[];
  improvementSuggestions: ImprovementSuggestion[];
  jobRecommendations: JobRecommendation[];
}