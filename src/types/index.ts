export interface ContentModerationRequest {
  content: string;
  userId?: string;
  platform?: string;
}

export interface ContentModerationResponse {
  isProblematic: boolean;
  confidence: number;
  categories: string[];
  reasoning: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface ModerationCategory {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GeminiResponse {
  isProblematic: boolean;
  confidence: number;
  categories: string[];
  reasoning: string;
  severity: string;
}
