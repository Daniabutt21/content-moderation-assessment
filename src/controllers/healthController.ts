import { Request, Response } from 'express';

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the content moderation API service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "healthy"
 *               timestamp: "2024-01-15T10:30:00Z"
 *               service: "content-moderation-api"
 *       500:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export class HealthController {
  static getHealth(req: Request, res: Response) {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'content-moderation-api'
    });
  }
}
