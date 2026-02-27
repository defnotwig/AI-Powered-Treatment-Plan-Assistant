import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

/**
 * Assigns a unique correlation ID to every incoming request.
 * - If the client sends an `x-correlation-id` header, it is preserved.
 * - Otherwise a new UUID v4 is generated.
 * - The correlation ID is echoed back in the response header.
 */
export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-correlation-id'] as string) || uuidv4();
  req.correlationId = id;
  res.setHeader('x-correlation-id', id);
  next();
}
