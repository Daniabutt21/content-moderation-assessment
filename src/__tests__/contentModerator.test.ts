import { ContentModerator } from '../services/contentModerator';
import { GeminiService } from '../services/geminiService';
import { ContentModerationRequest, ContentModerationResponse, ModerationCategory } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const skipTests = !GEMINI_API_KEY;

describe('ContentModerator - Real API Tests', () => {
  let contentModerator: ContentModerator;
  let geminiService: GeminiService;

  beforeAll(() => {
    if (skipTests) {
      console.warn('Skipping ContentModerator real API tests because GEMINI_API_KEY is not set.');
    }
  });

  beforeEach(() => {
    if (skipTests) return;
    geminiService = new GeminiService(GEMINI_API_KEY || '');
    contentModerator = new ContentModerator(geminiService);
  });

  // Helper function to create conditional describe blocks
  const conditionalDescribe = skipTests ? describe.skip : describe;

  conditionalDescribe('Basic Validation', () => {
    it('should flag empty content', async () => {
      const request: ContentModerationRequest = {
        content: ''
      };

      const result = await contentModerator.moderateContent(request);

      expect(result.isProblematic).toBe(true);
      expect(result.categories).toContain('empty_content');
      expect(result.severity).toBe('low');
    });

    it('should flag content that is too long', async () => {
      const longContent = 'a'.repeat(10001);
      const request: ContentModerationRequest = {
        content: longContent
      };

      const result = await contentModerator.moderateContent(request);

      expect(result.isProblematic).toBe(true);
      expect(result.categories).toContain('excessive_length');
      expect(result.severity).toBe('medium');
    });
  });

  conditionalDescribe('Content Analysis with Real API', () => {
    it('should analyze clean content', async () => {
      const request: ContentModerationRequest = {
        content: 'This is a normal, friendly message.'
      };

      const result = await contentModerator.moderateContent(request);

      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.categories)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should analyze content with user context', async () => {
      const request: ContentModerationRequest = {
        content: 'This is a test message',
        userId: 'user123',
        platform: 'twitter'
      };

      const result = await contentModerator.moderateContent(request);

      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('recommendations');
    });
  });

  conditionalDescribe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Create a service with invalid API key to test error handling
      const invalidService = new GeminiService('invalid-key');
      const errorModerator = new ContentModerator(invalidService);

      const request: ContentModerationRequest = {
        content: 'This should cause an API error'
      };

      // The service should handle the error and provide a fallback response
      const result = await errorModerator.moderateContent(request);

      expect(result).toHaveProperty('isProblematic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('recommendations');
      
      // For API errors, content should not be marked as problematic
      expect(result.isProblematic).toBe(false);
      expect(result.categories).toContain('api_error');
      expect(result.recommendations).toContain('Content moderation temporarily unavailable. Please try again later.');
    });
  });

  conditionalDescribe('Category Retrieval', () => {
    it('should return a list of moderation categories', () => {
      const categories = contentModerator.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check that categories have the expected structure
      categories.forEach((category: ModerationCategory) => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('severity');
        expect(['low', 'medium', 'high', 'critical']).toContain(category.severity);
      });

      // Check for some expected categories
      const categoryNames = categories.map((cat: ModerationCategory) => cat.name);
      const expectedCategories = ['hate_speech', 'sexual_content', 'violence', 'spam'];
      const hasExpectedCategories = expectedCategories.some(expected => 
        categoryNames.some(actual => actual.includes(expected))
      );
      expect(hasExpectedCategories).toBe(true);
    });
  });
});

// Tests that run regardless of API key availability
describe('ContentModerator - Basic Functionality', () => {
  let contentModerator: ContentModerator;

  beforeEach(() => {
    // Create a mock service for basic functionality tests
    const mockGeminiService = {
      moderateContent: jest.fn().mockResolvedValue({
        isProblematic: false,
        confidence: 0.5,
        categories: [],
        reasoning: 'Mock response',
        severity: 'low'
      })
    } as any;

    contentModerator = new ContentModerator(mockGeminiService);
  });

  it('should return proper response structure', async () => {
    const request: ContentModerationRequest = {
      content: 'Test content'
    };

    const result = await contentModerator.moderateContent(request);

    expect(result).toHaveProperty('isProblematic');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('reasoning');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('recommendations');

    expect(typeof result.isProblematic).toBe('boolean');
    expect(typeof result.confidence).toBe('number');
    expect(Array.isArray(result.categories)).toBe(true);
    expect(typeof result.reasoning).toBe('string');
    expect(['low', 'medium', 'high', 'critical']).toContain(result.severity);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('should return categories without API key', () => {
    const categories = contentModerator.getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });
});