import { GeminiService } from './geminiService';
import { 
  ContentModerationRequest, 
  ContentModerationResponse, 
  ModerationCategory 
} from '../types';

export class ContentModerator {
  private geminiService: GeminiService;
  private categories: ModerationCategory[];

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
    this.categories = this.initializeCategories();
  }

  async moderateContent(request: ContentModerationRequest): Promise<ContentModerationResponse> {
    // Step 1: Basic content validation
    const basicValidation = this.performBasicValidation(request.content);
    if (basicValidation.isProblematic) {
      return basicValidation;
    }

    // Step 2: Use Gemini AI for advanced analysis
    const geminiResponse = await this.geminiService.moderateContent(request);
    
    // Step 3: Apply business rules and post-processing
    const finalResponse = this.applyBusinessRules(geminiResponse, request);
    
    return finalResponse;
  }

  private performBasicValidation(content: string): ContentModerationResponse {
    // Basic checks that don't require AI
    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
      return {
        isProblematic: true,
        confidence: 1.0,
        categories: ['empty_content'],
        reasoning: 'Content is empty',
        severity: 'low',
        recommendations: ['Please provide meaningful content']
      };
    }

    if (trimmedContent.length > 10000) {
      return {
        isProblematic: true,
        confidence: 0.8,
        categories: ['excessive_length'],
        reasoning: 'Content exceeds maximum length limit',
        severity: 'medium',
        recommendations: ['Please shorten your content to under 10,000 characters']
      };
    }

    // Check for obvious spam patterns
    // Check for repeated characters (10+ of the same character)
    if (/(.)\1{9,}/.test(content)) {
      return {
        isProblematic: true,
        confidence: 0.9,
        categories: ['spam'],
        reasoning: 'Content matches spam patterns - repeated characters',
        severity: 'high',
        recommendations: ['Please avoid spam-like content patterns']
      };
    }

    // Check for excessive repetition patterns
    // Look for patterns like "word word word" or "phrase phrase phrase"
    const words = content.toLowerCase().split(/\s+/);
    if (words.length > 10) {
      const wordFrequency: { [key: string]: number } = {};
      words.forEach(word => {
        if (word.length > 2) { // Only count words longer than 2 characters
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
      
      // Check if any word appears more than 30% of the time
      const totalWords = Object.keys(wordFrequency).length;
      const maxFrequency = Math.max(...Object.values(wordFrequency));
      const repetitionRatio = maxFrequency / words.length;
      
      if (repetitionRatio > 0.3 && words.length > 10) {
        return {
          isProblematic: true,
          confidence: 0.8,
          categories: ['spam'],
          reasoning: 'Content shows excessive repetition patterns',
          severity: 'medium',
          recommendations: ['Please vary your content and avoid excessive repetition']
        };
      }
    }

    // Check for excessive special characters or symbols
    const specialCharCount = (content.match(/[!@#$%^&*()_+=\[\]{}|;':",./<>?~`]/g) || []).length;
    const totalCharCount = content.length;
    const specialCharRatio = specialCharCount / totalCharCount;
    
    if (specialCharRatio > 0.2 && totalCharCount > 50) {
      return {
        isProblematic: true,
        confidence: 0.7,
        categories: ['spam'],
        reasoning: 'Content contains excessive special characters',
        severity: 'medium',
        recommendations: ['Please reduce the use of special characters']
      };
    }

    return {
      isProblematic: false,
      confidence: 0.1,
      categories: [],
      reasoning: 'Basic validation passed',
      severity: 'low',
      recommendations: []
    };
  }

  private applyBusinessRules(
    geminiResponse: any, 
    request: ContentModerationRequest
  ): ContentModerationResponse {
    let finalResponse: ContentModerationResponse = {
      isProblematic: geminiResponse.isProblematic,
      confidence: geminiResponse.confidence,
      categories: geminiResponse.categories,
      reasoning: geminiResponse.reasoning,
      severity: geminiResponse.severity as 'low' | 'medium' | 'high' | 'critical',
      recommendations: []
    };

    // Handle API error categories - these should not be marked as problematic
    const apiErrorCategories = ['api_rate_limit', 'api_auth_error', 'api_server_error', 'api_error'];
    const hasApiError = finalResponse.categories.some(cat => apiErrorCategories.includes(cat));
    
    if (hasApiError) {
      // For API errors, we should not mark content as problematic
      finalResponse.isProblematic = false;
      finalResponse.recommendations.push('Content moderation temporarily unavailable. Please try again later.');
      return finalResponse;
    }

    // Apply severity-based business rules
    if (finalResponse.severity === 'critical') {
      finalResponse.isProblematic = true;
      finalResponse.confidence = Math.max(finalResponse.confidence, 0.9);
      finalResponse.recommendations.push('Immediate content removal required');
    }

    if (finalResponse.severity === 'high') {
      finalResponse.isProblematic = true;
      finalResponse.confidence = Math.max(finalResponse.confidence, 0.8);
      finalResponse.recommendations.push('Content should be reviewed by human moderators');
    }

    // Platform-specific rules
    if (request.platform === 'youtube' && finalResponse.categories.includes('explicit_content')) {
      finalResponse.severity = 'high';
      finalResponse.recommendations.push('Consider age-restricting this content');
    }

    // Confidence threshold adjustment
    if (finalResponse.confidence < 0.5 && finalResponse.severity === 'low') {
      finalResponse.isProblematic = false;
    }

    // Add general recommendations based on categories
    finalResponse.recommendations.push(...this.getRecommendationsForCategories(finalResponse.categories));

    return finalResponse;
  }

  private getRecommendationsForCategories(categories: string[]): string[] {
    const recommendations: string[] = [];
    
    if (categories.includes('hate_speech')) {
      recommendations.push('Consider using more inclusive language');
    }
    
    if (categories.includes('harassment')) {
      recommendations.push('Please be respectful in your communication');
    }
    
    if (categories.includes('violence')) {
      recommendations.push('Avoid content that promotes violence');
    }
    
    if (categories.includes('misinformation')) {
      recommendations.push('Please verify facts before sharing');
    }
    
    if (categories.includes('spam')) {
      recommendations.push('Avoid repetitive or promotional content');
    }

    return recommendations;
  }

  private initializeCategories(): ModerationCategory[] {
    return [
      {
        name: 'hate_speech',
        description: 'Content that attacks or demeans groups based on protected characteristics',
        severity: 'high'
      },
      {
        name: 'harassment',
        description: 'Content intended to harass, bully, or intimidate',
        severity: 'high'
      },
      {
        name: 'violence',
        description: 'Content promoting or glorifying violence',
        severity: 'critical'
      },
      {
        name: 'explicit_content',
        description: 'Sexual or adult content',
        severity: 'medium'
      },
      {
        name: 'misinformation',
        description: 'False or misleading information',
        severity: 'medium'
      },
      {
        name: 'spam',
        description: 'Repetitive or promotional content',
        severity: 'low'
      },
      {
        name: 'self_harm',
        description: 'Content promoting self-harm or suicide',
        severity: 'critical'
      },
      {
        name: 'illegal_activities',
        description: 'Content promoting illegal activities',
        severity: 'critical'
      },
      {
        name: 'terrorism',
        description: 'Content promoting terrorism or extremism',
        severity: 'critical'
      }
    ];
  }

  getCategories(): ModerationCategory[] {
    return this.categories;
  }
}
