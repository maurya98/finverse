/**
 * Permissions API Service
 * Handles all permission-related API calls
 */

import apiRequest from './api';

export interface Permission {
  id: string;
  clientId: string;
  routeId: string;
  description: string;
  scope: 'READ' | 'WRITE' | 'FULL';
  isActive: boolean;
}

export interface CreatePermissionPayload {
  clientId: string;
  routeId: string;
  scope: 'READ' | 'WRITE' | 'FULL';
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionPayload {
  clientId?: string;
  routeId?: string;
  scope?: 'READ' | 'WRITE' | 'FULL';
  description?: string;
  isActive?: boolean;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Get all permissions
 */
export async function getAllPermissions(): Promise<Permission[]> {
  const response = await apiRequest<APIResponse<Permission[]>>(
    '/api/admin/permissions'
  );
  return response.data || [];
}

/**
 * Get a single permission by ID
 */
export async function getPermissionById(id: string): Promise<Permission> {
  const response = await apiRequest<APIResponse<Permission>>(
    `/api/admin/permissions/${id}`
  );
  return response.data;
}

/**
 * Assign a permission
 */
export async function createPermission(payload: CreatePermissionPayload): Promise<Permission> {
  const response = await apiRequest<APIResponse<Permission>>(
    '/api/admin/permissions',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Assign multiple permissions
 */
export async function createBulkPermissions(
  payloads: CreatePermissionPayload[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/permissions/bulk',
    {
      method: 'POST',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Update a permission
 */
export async function updatePermission(
  id: string,
  payload: UpdatePermissionPayload
): Promise<Permission> {
  const response = await apiRequest<APIResponse<Permission>>(
    `/api/admin/permissions/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Update multiple permissions
 */
export async function updateBulkPermissions(
  payloads: (UpdatePermissionPayload & { id: string })[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/permissions/bulk',
    {
      method: 'PUT',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Delete a permission
 */
export async function deletePermission(id: string): Promise<{ message: string }> {
  const response = await apiRequest<APIResponse<{ message: string }>>(
    `/api/admin/permissions/${id}`,
    {
      method: 'DELETE',
    }
  );
  return response.data;
}

/**
 * Delete multiple permissions
 */
export async function deleteBulkPermissions(ids: string[]): Promise<{ message: string }> {
  const response = await apiRequest<APIResponse<{ message: string }>>(
    '/api/admin/permissions/bulk',
    {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }
  );
  return response.data;
}
