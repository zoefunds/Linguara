import { Response } from 'express';

export const sendSuccess = (res: Response, data: unknown, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

export const sendError = (res: Response, message: string, statusCode = 400, errors?: unknown) => {
  res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
};

export const sendPaginated = (
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) => {
  res.status(200).json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};
