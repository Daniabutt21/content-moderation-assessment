import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ContentModerator } from '../services/contentModerator';
import { GeminiService } from '../services/geminiService';
import { ContentModerationRequest } from '../types';

// Load environment variables
dotenv.config();

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found in environment variables. Integration tests will be skipped.');
}

// Create a test app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize real services
const geminiService = new GeminiService(apiKey || '');
const contentModerator = new ContentModerator(geminiService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'content-moderation-api'
  });
});

// Main content moderation endpoint
app.post('/moderate', async (req, res) => {
  try {
    const request: ContentModerationRequest = req.body;
    
    if (!request.content) {
      return res.status(400).json({
        error: 'Content is required',
        message: 'Please provide content to moderate'
      });
    }

    const result = await contentModerator.moderateContent(request);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in content moderation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to moderate content',
      timestamp: new Date().toISOString()
    });
  }
});

// Batch moderation endpoint
app.post('/moderate/batch', async (req, res) => {
  try {
    const { contents } = req.body;
    
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Contents array is required and must not be empty'
      });
    }

    if (contents.length > 10) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Maximum 10 items allowed per batch'
      });
    }

    // Process all items in parallel using Promise.allSettled
    const results = await Promise.allSettled(
      contents.map(async (content: ContentModerationRequest) => {
        try {
          const result = await contentModerator.moderateContent(content);
          return { 
            success: true, 
            data: result 
          };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in batch moderation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process batch moderation',
      timestamp: new Date().toISOString()
    });
  }
});

// Categories endpoint
app.get('/categories', (req, res) => {
  try {
    const categories = contentModerator.getCategories();
    res.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get categories',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

describe('Integration Tests - Real API Calls', () => {
  // Skip all tests if no API key is available
  const conditionalDescribe = apiKey ? describe : describe.skip;
  
  conditionalDescribe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'content-moderation-api');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  conditionalDescribe('Content Moderation', () => {
    it('should moderate clean content successfully', async () => {
      const response = await request(app)
        .post('/moderate')
        .send({
          content: 'Hello, how are you today? This is a friendly message.'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('isProblematic');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('reasoning');
      expect(response.body.data).toHaveProperty('severity');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    it('should return 400 for missing content', async () => {
      const response = await request(app)
        .post('/moderate')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Content is required');
    });
  });

  conditionalDescribe('Batch Moderation', () => {
    it('should process multiple content items', async () => {
      const response = await request(app)
        .post('/moderate/batch')
        .send({
          contents: [
            { content: 'Hello world' },
            { content: 'How are you?' }
          ]
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      
      response.body.data.forEach((result: any) => {
        expect(result).toHaveProperty('status', 'fulfilled');
        expect(result.value).toHaveProperty('success', true);
        expect(result.value).toHaveProperty('data');
        expect(result.value.data).toHaveProperty('isProblematic');
        expect(result.value.data).toHaveProperty('confidence');
        expect(result.value.data).toHaveProperty('categories');
        expect(result.value.data).toHaveProperty('reasoning');
        expect(result.value.data).toHaveProperty('severity');
        expect(result.value.data).toHaveProperty('recommendations');
      });
    });

    it('should return 400 for empty batch', async () => {
      const response = await request(app)
        .post('/moderate/batch')
        .send({
          contents: []
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request');
    });
  });

  conditionalDescribe('Category Retrieval', () => {
    it('should return a list of moderation categories', async () => {
      const response = await request(app).get('/categories').expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('description');
      expect(response.body.data[0]).toHaveProperty('severity');
    });
  });
});