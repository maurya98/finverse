/**
 * Applications API Service
 * Handles all application-related API calls
 */

import apiRequest from './api';

export interface Application {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  secret: string;
  createdAt: string;
}

export interface CreateApplicationPayload {
  name: string;
  description?: string;
}

export interface UpdateApplicationPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Get all applications
 */
export async function getAllApplications(): Promise<Application[]> {
  const response = await apiRequest<APIResponse<Application[]>>(
    '/api/admin/applications'
  );
  return response.data || [];
}

/**
 * Get a single application by ID
 */
export async function getApplicationById(id: string): Promise<Application> {
  const response = await apiRequest<APIResponse<Application>>(
    `/api/admin/applications/${id}`
  );
  return response.data;
}

/**
 * Create a new application
 */
export async function createApplication(payload: CreateApplicationPayload): Promise<Application> {
  const response = await apiRequest<APIResponse<Application>>(
    '/api/admin/applications',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Create multiple applications
 */
export async function createBulkApplications(
  payloads: CreateApplicationPayload[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/applications/bulk',
    {
      method: 'POST',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Update an application
 */
export async function updateApplication(
  id: string,
  payload: UpdateApplicationPayload
): Promise<Application> {
  const response = await apiRequest<APIResponse<Application>>(
    `/api/admin/applications/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Update multiple applications
 */
export async function updateBulkApplications(
  payloads: (UpdateApplicationPayload & { id: string })[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/applications/bulk',
    {
      method: 'PUT',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<{ message: string }> {
  const response = await apiRequest<APIResponse<{ message: string }>>(
    `/api/admin/applications/${id}`,
    {
      method: 'DELETE',
    }
  );
  return response.data;
}

/**
 * Rotate the secret key for an application
 */
export async function rotateApplicationKey(id: string): Promise<{ message: string; secret: string }> {
  const response = await apiRequest<APIResponse<{ message: string; secret: string }>>(
    `/api/admin/applications/${id}/rotate-key`,
    {
      method: 'POST',
    }
  );
  return response.data;
}
