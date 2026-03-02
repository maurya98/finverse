/**
 * Routes API Service
 * Handles all route-related API calls
 */

import apiRequest from './api';

export interface Route {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  method: string;
  actualPath: string;
  exposedPath: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRoutePayload {
  serviceId: string;
  name: string;
  method: string;
  actualPath: string;
  exposedPath: string;
  description?: string;
}

export interface UpdateRoutePayload {
  serviceId?: string;
  name?: string;
  method?: string;
  actualPath?: string;
  exposedPath?: string;
  description?: string;
  isActive?: boolean;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Get all routes
 */
export async function getAllRoutes(): Promise<Route[]> {
  const response = await apiRequest<APIResponse<Route[]>>(
    '/api/admin/routes'
  );
  return response.data || [];
}

/**
 * Get a single route by ID
 */
export async function getRouteById(id: string): Promise<Route> {
  const response = await apiRequest<APIResponse<Route>>(
    `/api/admin/routes/${id}`
  );
  return response.data;
}

/**
 * Create a new route
 */
export async function createRoute(payload: CreateRoutePayload): Promise<Route> {
  const response = await apiRequest<APIResponse<Route>>(
    '/api/admin/routes',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Create multiple routes
 */
export async function createBulkRoutes(
  payloads: CreateRoutePayload[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/routes/bulk',
    {
      method: 'POST',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Update a route
 */
export async function updateRoute(
  id: string,
  payload: UpdateRoutePayload
): Promise<Route> {
  const response = await apiRequest<APIResponse<Route>>(
    `/api/admin/routes/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Update multiple routes
 */
export async function updateBulkRoutes(
  payloads: (UpdateRoutePayload & { id: string })[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/routes/bulk',
    {
      method: 'PUT',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Delete a route
 */
export async function deleteRoute(id: string): Promise<{ message: string }> {
  const response = await apiRequest<APIResponse<{ message: string }>>(
    `/api/admin/routes/${id}`,
    {
      method: 'DELETE',
    }
  );
  return response.data;
}

/**
 * Delete multiple routes
 */
export async function deleteBulkRoutes(ids: string[]): Promise<{ message: string }> {
  const response = await apiRequest<APIResponse<{ message: string }>>(
    '/api/admin/routes/bulk',
    {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }
  );
  return response.data;
}
