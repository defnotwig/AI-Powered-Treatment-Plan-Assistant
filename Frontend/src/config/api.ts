/**
 * Centralized API configuration.
 *
 * All frontend fetch calls should import `API_BASE` from here instead of
 * hardcoding `/api` paths.  When the backend moves to v2, only this file
 * needs to change.
 */

/** Current API version prefix */
export const API_VERSION = 'v1' as const;

/** Base URL for all versioned API calls (e.g. `/api/v1`) */
export const API_BASE = `/api/${API_VERSION}` as const;

/**
 * Build a fully-qualified API URL.
 *
 * @example
 *   apiUrl('/patients')        → '/api/v1/patients'
 *   apiUrl('/ml/training-data') → '/api/v1/ml/training-data'
 */
export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
