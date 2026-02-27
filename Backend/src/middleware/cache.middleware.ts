import { Request, Response, NextFunction, RequestHandler } from 'express';
import { responseCache } from '../services/response-cache.service';

interface CacheOptions {
  ttlMs: number;
  tags?: string[];
}

function applyCacheHeaders(res: Response, ttlMs: number): void {
  const maxAgeSeconds = Math.max(1, Math.floor(ttlMs / 1000));
  res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}`);
}

export function cacheResponse(options: CacheOptions): RequestHandler {
  const tags = options.tags || [];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = responseCache.buildKey(req.method, req.originalUrl, req.query as Record<string, unknown>);
    const cached = responseCache.get(cacheKey);

    if (cached) {
      if (cached.contentType) {
        res.setHeader('Content-Type', cached.contentType);
      }
      applyCacheHeaders(res, cached.expiresAt - Date.now());
      res.setHeader('X-Cache', 'HIT');
      res.status(cached.statusCode).send(cached.body);
      return;
    }

    const originalSend = res.send.bind(res);
    res.send = (body?: unknown): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const serialized = typeof body === 'string' ? body : JSON.stringify(body);
        responseCache.set(cacheKey, {
          body: serialized,
          contentType: res.getHeader('Content-Type')?.toString(),
          statusCode: res.statusCode,
          expiresAt: Date.now() + options.ttlMs,
          tags,
        });
        res.setHeader('X-Cache', 'MISS');
        applyCacheHeaders(res, options.ttlMs);
      }

      return originalSend(body as never);
    };

    next();
  };
}

export function invalidateCacheTags(tags: string[]): void {
  for (const tag of tags) {
    responseCache.invalidateByTag(tag);
  }
}
