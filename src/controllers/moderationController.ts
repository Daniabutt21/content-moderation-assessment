import { Request, Response } from 'express';
import { ContentModerator } from '../services/contentModerator';
import { ContentModerationRequest } from '../types';

export class ModerationController {
  constructor(private contentModerator: ContentModerator) {}

  /**
   * @swagger
   * /moderate:
   *   post:
   *     summary: Moderate single content item
   *     description: Analyzes a single piece of content for problematic material using AI-powered moderation
   *     tags: [Moderation]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ContentModerationRequest'
   *           examples:
   *             content_moderation:
   *               summary: Content moderation example
   *               value:
   *                 content: "This is a sample text that needs to be checked for problematic content."
   *                 userId: "user123"
   *                 platform: "twitter"
   *     responses:
   *       200:
   *         description: Content moderation completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ContentModerationResponse'
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00Z"
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async moderateContent(req: Request, res: Response) {
    try {
      const request: ContentModerationRequest = req.body;
      
      if (!request.content) {
        return res.status(400).json({
          error: 'Content is required',
          message: 'Please provide content to moderate'
        });
      }

      const result = await this.contentModerator.moderateContent(request);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to moderate content',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /moderate/batch:
   *   post:
   *     summary: Moderate multiple content items in batch
   *     description: Analyzes multiple pieces of content for problematic material in a single request (up to 10 items)
   *     tags: [Moderation]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BatchModerationRequest'
   *           examples:
   *             multiple_texts:
   *               summary: Multiple text content moderation
   *               value:
   *                 contents:
   *                   - content: "This is a sample text that needs to be checked."
   *                     userId: "user123"
   *                   - content: "Another piece of content to moderate."
   *                     userId: "user456"
   *                   - content: "Third content item for batch processing."
   *                     userId: "user789"
   *     responses:
   *       200:
   *         description: Batch moderation completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       index:
   *                         type: number
   *                         description: Index of the content item in the original request
   *                         example: 0
   *                       success:
   *                         type: boolean
   *                         description: Whether moderation was successful for this item
   *                         example: true
   *                       data:
   *                         $ref: '#/components/schemas/ContentModerationResponse'
   *                       error:
   *                         type: string
   *                         description: Error message if moderation failed
   *                         example: null
   *                 summary:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: number
   *                       description: Total number of items processed
   *                       example: 3
   *                     successful:
   *                       type: number
   *                       description: Number of successfully moderated items
   *                       example: 3
   *                     failed:
   *                       type: number
   *                       description: Number of failed moderation attempts
   *                       example: 0
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00Z"
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async moderateBatch(req: Request, res: Response) {
    try {
      const requests: ContentModerationRequest[] = req.body.contents;
      
      if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Please provide an array of content to moderate'
        });
      }

      if (requests.length > 10) {
        return res.status(400).json({
          error: 'Too many requests',
          message: 'Maximum 10 items allowed per batch request'
        });
      }

      const results = await Promise.all(
        requests.map(async (request, index) => {
          try {
            const result = await this.contentModerator.moderateContent(request);
            return { index, success: true, data: result };
          } catch (error) {
            return { 
              index, 
              success: false, 
              error: 'Failed to moderate content' 
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
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process batch moderation',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /moderate/categories:
   *   get:
   *     summary: Get available moderation categories
   *     description: Returns a list of all available content moderation categories with their descriptions and severity levels
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Categories retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ModerationCategory'
   *                   example:
   *                     - name: "hate_speech"
   *                       description: "Content that attacks or demeans groups based on protected characteristics"
   *                       severity: "high"
   *                     - name: "harassment"
   *                       description: "Content that targets individuals with abusive or threatening language"
   *                       severity: "medium"
   *                     - name: "violence"
   *                       description: "Content that promotes or glorifies violence"
   *                       severity: "high"
   *                     - name: "explicit_content"
   *                       description: "Sexually explicit or adult content"
   *                       severity: "medium"
   *                     - name: "misinformation"
   *                       description: "False or misleading information"
   *                       severity: "medium"
   *                     - name: "spam"
   *                       description: "Repetitive, promotional, or low-quality content"
   *                       severity: "low"
   *                     - name: "self_harm"
   *                       description: "Content that promotes self-harm or suicide"
   *                       severity: "critical"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00Z"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  getCategories(req: Request, res: Response) {
    try {
      const categories = this.contentModerator.getCategories();
      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch categories',
        timestamp: new Date().toISOString()
      });
    }
  }
}
