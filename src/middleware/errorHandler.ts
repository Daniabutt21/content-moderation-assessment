import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
};
