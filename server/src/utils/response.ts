import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message?: string, status = 200) {
  res.status(status).json({ success: true, data, message });
}

export function sendError(res: Response, message: string, status = 400, error?: unknown) {
  const errorMsg = error instanceof Error ? error.message : undefined;
  res.status(status).json({ success: false, message, error: errorMsg });
}
