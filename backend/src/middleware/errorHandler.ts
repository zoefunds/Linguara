import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (res.headersSent) return next(err);

  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  sendError(res, message, statusCode);
}

export function notFound(req: Request, res: Response) {
  sendError(res, `Route ${req.path} not found`, 404);
}
