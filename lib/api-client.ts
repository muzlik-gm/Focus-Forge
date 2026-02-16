/**
 * API Client Utilities
 * 
 * Provides helper functions for making authenticated API requests with CSRF protection.
 * 
 * Requirements: 1.5
 */

import { getCsrfToken, CSRF_HEADER_NAME } from './csrf';

/**
 * Fetch options with CSRF token
 */
interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Make an authenticated API request with CSRF protection
 * 
 * This function automatically includes the CSRF token in the request headers
 * for POST, PUT, PATCH, and DELETE requests.
 * 
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise<Response> The fetch response
 * 
 * Usage:
 * ```typescript
 * import { fetchWithCsrf } from '@/lib/api-client';
 * 
 * // POST request
 * const response = await fetchWithCsrf('/api/tasks', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ title: 'New task' }),
 * });
 * 
 * // GET request (CSRF token not needed but won't hurt)
 * const response = await fetchWithCsrf('/api/tasks');
 * ```
 * 
 * Requirements: 1.5 - CSRF protection on authenticated requests
 */
export async function fetchWithCsrf(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  const requiresCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Get CSRF token if needed
  let csrfToken: string | null = null;
  if (requiresCsrf) {
    csrfToken = await getCsrfToken();
  }

  // Prepare headers
  const headers = new Headers(options.headers);
  
  // Add CSRF token header if available
  if (csrfToken) {
    headers.set(CSRF_HEADER_NAME, csrfToken);
  }

  // Make the request
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make a POST request with CSRF protection
 * 
 * @param url - The API endpoint URL
 * @param data - The request body data (will be JSON stringified)
 * @param options - Additional fetch options
 * @returns Promise<Response> The fetch response
 * 
 * Usage:
 * ```typescript
 * import { post } from '@/lib/api-client';
 * 
 * const response = await post('/api/tasks', {
 *   title: 'New task',
 *   priority: 'HIGH',
 * });
 * 
 * const result = await response.json();
 * ```
 */
export async function post(
  url: string,
  data: unknown,
  options: FetchOptions = {}
): Promise<Response> {
  return fetchWithCsrf(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Make a PUT request with CSRF protection
 * 
 * @param url - The API endpoint URL
 * @param data - The request body data (will be JSON stringified)
 * @param options - Additional fetch options
 * @returns Promise<Response> The fetch response
 */
export async function put(
  url: string,
  data: unknown,
  options: FetchOptions = {}
): Promise<Response> {
  return fetchWithCsrf(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Make a PATCH request with CSRF protection
 * 
 * @param url - The API endpoint URL
 * @param data - The request body data (will be JSON stringified)
 * @param options - Additional fetch options
 * @returns Promise<Response> The fetch response
 */
export async function patch(
  url: string,
  data: unknown,
  options: FetchOptions = {}
): Promise<Response> {
  return fetchWithCsrf(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Make a DELETE request with CSRF protection
 * 
 * @param url - The API endpoint URL
 * @param options - Additional fetch options
 * @returns Promise<Response> The fetch response
 */
export async function del(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  return fetchWithCsrf(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * Make a GET request (no CSRF protection needed)
 * 
 * @param url - The API endpoint URL
 * @param options - Additional fetch options
 * @returns Promise<Response> The fetch response
 */
export async function get(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    method: 'GET',
  });
}
