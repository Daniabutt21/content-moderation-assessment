import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContentModerationRequest, GeminiResponse } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async moderateContent(request: ContentModerationRequest): Promise<GeminiResponse> {
    const prompt = this.buildModerationPrompt(request.content);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Handle different types of API errors gracefully
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        
        if (status === 429) {
          // Rate limit exceeded - return a safe fallback
          return {
            isProblematic: false,
            confidence: 0.5,
            categories: ['api_rate_limit'],
            reasoning: 'API rate limit exceeded. Content could not be analyzed.',
            severity: 'low'
          };
        } else if (status === 403 || status === 401) {
          // Authentication/authorization error
          return {
            isProblematic: false,
            confidence: 0.5,
            categories: ['api_auth_error'],
            reasoning: 'API authentication failed. Content could not be analyzed.',
            severity: 'low'
          };
        } else if (status >= 500) {
          // Server error
          return {
            isProblematic: false,
            confidence: 0.5,
            categories: ['api_server_error'],
            reasoning: 'API server error. Content could not be analyzed.',
            severity: 'low'
          };
        }
      }
      
      // Generic fallback for any other errors
      return {
        isProblematic: false,
        confidence: 0.5,
        categories: ['api_error'],
        reasoning: 'API error occurred. Content could not be analyzed.',
        severity: 'low'
      };
    }
  }

  private buildModerationPrompt(content: string): string {
    return `
You are a content moderation AI. Analyze the following content and determine if it contains problematic material.

Content to analyze: "${content}"

Please respond with a JSON object containing:
{
  "isProblematic": boolean,
  "confidence": number (0-1),
  "categories": string[],
  "reasoning": string,
  "severity": "low" | "medium" | "high" | "critical"
}

Categories to check for:
- hate_speech: Content that attacks or demeans groups based on race, religion, gender, etc.
- harassment: Content intended to harass, bully, or intimidate
- violence: Content promoting or glorifying violence
- explicit_content: Sexual or adult content
- misinformation: False or misleading information
- spam: Repetitive or promotional content
- self_harm: Content promoting self-harm or suicide
- illegal_activities: Content promoting illegal activities
- terrorism: Content promoting terrorism or extremism

Severity levels:
- low: Minor policy violations
- medium: Moderate violations requiring attention
- high: Serious violations requiring immediate action
- critical: Extremely dangerous content requiring immediate removal

Only respond with the JSON object, no additional text.
    `.trim();
  }

  private parseGeminiResponse(text: string): GeminiResponse {
    try {
      // Ensure text is a string
      const textStr = typeof text === 'string' ? text : String(text);
      
      // Clean the response text
      const cleanedText = textStr.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      
      return {
        isProblematic: parsed.isProblematic || false,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        reasoning: parsed.reasoning || 'No reasoning provided',
        severity: parsed.severity || 'low'
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      // Fallback response
      return {
        isProblematic: false,
        confidence: 0,
        categories: [],
        reasoning: 'Failed to parse AI response',
        severity: 'low'
      };
    }
  }
}
