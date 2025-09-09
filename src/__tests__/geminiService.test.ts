import { GeminiService } from '../services/geminiService';
import { ContentModerationRequest, GeminiResponse } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const skipTests = !GEMINI_API_KEY;

describe('GeminiService - Real API Tests', () => {
  let geminiService: GeminiService;

  beforeAll(() => {
    if (skipTests) {
      console.warn('Skipping GeminiService real API tests because GEMINI_API_KEY is not set.');
    }
  });

  beforeEach(() => {
    if (skipTests) return;
    geminiService = new GeminiService(GEMINI_API_KEY || '');
  });

  // Helper function to create conditional describe blocks
  const conditionalDescribe = skipTests ? describe.skip : describe;

  conditionalDescribe('Real API Integration', () => {
    it('should moderate clean content successfully', async () => {
      const request: ContentModerationRequest = {
        content: 'Hello, this is a test message.'
      };
      const result = await geminiService.moderateContent(request);
      
      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');

      expect(typeof result.isProblematic).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.categories)).toBe(true);
      expect(typeof result.reasoning).toBe('string');
      expect(['low', 'medium', 'high', 'critical']).toContain(result.severity);
    });

    it('should handle content with context', async () => {
      const request: ContentModerationRequest = {
        content: 'This is a test message with context',
        userId: 'user123',
        platform: 'social_media'
      };
      const result = await geminiService.moderateContent(request);
      
      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');
    });
  });

  conditionalDescribe('Error Handling', () => {
    it('should handle invalid API key gracefully', async () => {
      const invalidService = new GeminiService('invalid-api-key');
      const request: ContentModerationRequest = {
        content: 'This should cause an API error'
      };

      // The service should handle the error and provide a fallback response
      const result = await invalidService.moderateContent(request);

      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');

      // Should return API error response
      expect(result.isProblematic).toBe(false);
      expect(result.categories).toContain('api_error');
      expect(result.reasoning).toContain('API error occurred');
      expect(result.severity).toBe('low');
    });

    it('should handle network errors gracefully', async () => {
      // Create service with empty API key to simulate network issues
      const networkErrorService = new GeminiService('');
      const request: ContentModerationRequest = {
        content: 'This should cause a network error'
      };

      const result = await networkErrorService.moderateContent(request);

      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');
      
      // Should return API error response
      expect(result.isProblematic).toBe(false);
      expect(result.categories).toContain('api_auth_error');
      expect(result.reasoning).toContain('API authentication failed');
    });
  });

  conditionalDescribe('Response Parsing', () => {
    it('should parse valid JSON responses correctly', async () => {
      const request: ContentModerationRequest = {
        content: 'This is a valid JSON test.'
      };
      const result = await geminiService.moderateContent(request);
      
      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');
    });
  });
});

// Tests that run regardless of API key availability
describe('GeminiService - Basic Functionality', () => {
  it('should instantiate without errors', () => {
    const service = new GeminiService('test-key');
    expect(service).toBeInstanceOf(GeminiService);
  });

  it('should handle empty API key', () => {
    const service = new GeminiService('');
    expect(service).toBeInstanceOf(GeminiService);
  });
});