import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Content Moderation API',
    version: '1.0.0',
    description: 'A comprehensive content moderation system using Google Gemini Pro AI for evaluating problematic content before it gets posted to social media platforms.',
    contact: {
      name: 'Content Moderation Team',
      email: 'support@contentmoderation.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    },
    {
      url: 'https://api.contentmoderation.com/api',
      description: 'Production server'
    }
  ],
  components: {
    schemas: {
      ContentModerationRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: {
            type: 'string',
            description: 'The text content to be moderated',
            example: 'This is a sample text that needs to be checked for problematic content.'
          },
          userId: {
            type: 'string',
            description: 'Optional user ID for tracking',
            example: 'user123'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Optional timestamp of content creation',
            example: '2024-01-15T10:30:00Z'
          },
          platform: {
            type: 'string',
            description: 'Platform where content will be posted',
            example: 'twitter'
          }
        }
      },
      ContentModerationResponse: {
        type: 'object',
        properties: {
          isProblematic: {
            type: 'boolean',
            description: 'Whether the content is flagged as problematic',
            example: true
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Confidence level of the moderation decision (0-1)',
            example: 0.85
          },
          categories: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Categories of problematic content detected',
            example: ['hate_speech', 'harassment']
          },
          reasoning: {
            type: 'string',
            description: 'Explanation of why content was flagged',
            example: 'Content contains language that attacks groups based on protected characteristics'
          },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Severity level of the problematic content',
            example: 'high'
          },
          recommendations: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Recommended actions for the content',
            example: ['Consider using more inclusive language', 'Content should be reviewed by human moderators']
          }
        }
      },
      BatchModerationRequest: {
        type: 'object',
        required: ['contents'],
        properties: {
          contents: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ContentModerationRequest'
            },
            description: 'Array of content items to moderate',
            minItems: 1,
            maxItems: 100
          }
        }
      },
      BatchModerationResponse: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  description: 'Whether moderation was successful for this item'
                },
                data: {
                  $ref: '#/components/schemas/ContentModerationResponse'
                },
                error: {
                  type: 'string',
                  description: 'Error message if moderation failed'
                }
              }
            }
          },
          summary: {
            type: 'object',
            properties: {
              total: {
                type: 'number',
                description: 'Total number of items processed'
              },
              successful: {
                type: 'number',
                description: 'Number of successfully moderated items'
              },
              failed: {
                type: 'number',
                description: 'Number of failed moderation attempts'
              }
            }
          }
        }
      },
      ModerationCategory: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Category identifier',
            example: 'hate_speech'
          },
          description: {
            type: 'string',
            description: 'Description of the category',
            example: 'Content that attacks or demeans groups based on protected characteristics'
          },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Default severity level for this category',
            example: 'high'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Health status of the service',
            example: 'healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Current timestamp',
            example: '2024-01-15T10:30:00Z'
          },
          service: {
            type: 'string',
            description: 'Service name',
            example: 'content-moderation-api'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid request parameters'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp',
            example: '2024-01-15T10:30:00Z'
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad Request - Invalid input parameters',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Moderation',
      description: 'Content moderation endpoints'
    },
    {
      name: 'Categories',
      description: 'Moderation categories management'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);

