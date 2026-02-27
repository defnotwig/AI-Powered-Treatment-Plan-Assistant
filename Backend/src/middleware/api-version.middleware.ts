import { Request, Response, NextFunction, Router } from 'express';
import logger from '../config/logger';

/**
 * Supported API versions. The first element is the current default.
 */
export const SUPPORTED_VERSIONS = ['v1'] as const;
export type ApiVersion = (typeof SUPPORTED_VERSIONS)[number];
export const CURRENT_VERSION: ApiVersion = 'v1';

/**
 * Extend Express Request with resolved API version.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      apiVersion?: ApiVersion;
    }
  }
}

/**
 * Middleware that stamps every versioned response with standard headers.
 *
 *  - `API-Version`  – the resolved version serving this request
 *  - `X-API-Versions` – all versions the server supports
 */
export function versionHeaders(req: Request, res: Response, next: NextFunction): void {
  const version = req.apiVersion ?? CURRENT_VERSION;
  res.setHeader('API-Version', version);
  res.setHeader('X-API-Versions', SUPPORTED_VERSIONS.join(', '));
  next();
}

/**
 * Middleware factory that creates deprecation aliases for un-versioned routes.
 *
 * When a consumer hits `/api/patients` instead of `/api/v1/patients`, the
 * request is still served but the response includes deprecation headers
 * signalling clients to migrate to the versioned path.
 *
 * @param versionedRouter - The v1 router to forward un-versioned traffic to.
 * @returns Express Router that proxies all un-versioned `/api/*` requests
 *          through to the v1 router with deprecation warnings.
 */
export function deprecatedUnversionedProxy(versionedRouter: Router): Router {
  const proxy = Router();

  // Sunset date: 6 months from now
  const sunsetDate = new Date();
  sunsetDate.setMonth(sunsetDate.getMonth() + 6);
  const sunsetString = sunsetDate.toUTCString();

  proxy.use((req: Request, res: Response, next: NextFunction) => {
    // Tag the request so downstream code knows this was un-versioned
    req.apiVersion = CURRENT_VERSION;

    // RFC 8594 Deprecation + Sunset headers
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', sunsetString);
    res.setHeader('Link', `</api/${CURRENT_VERSION}${req.path}>; rel="successor-version"`);

    logger.debug('Un-versioned API call forwarded', {
      originalPath: req.originalUrl,
      forwardedTo: `/api/${CURRENT_VERSION}${req.path}`,
      correlationId: req.correlationId,
    });

    next();
  });

  // Forward everything to the versioned router
  proxy.use(versionedRouter);

  return proxy;
}
