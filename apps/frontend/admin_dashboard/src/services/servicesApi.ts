/**
 * Services API Service
 * Handles all service-related API calls
 */

import apiRequest from './api';

export interface Service {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateServicePayload {
  name: string;
  baseUrl: string;
  description?: string;
}

export interface UpdateServicePayload {
  name?: string;
  baseUrl?: string;
  description?: string;
  isActive?: boolean;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Get all services
 */
export async function getAllServices(): Promise<Service[]> {
  const response = await apiRequest<APIResponse<Service[]>>(
    '/api/admin/services'
  );
  return response.data || [];
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id: string): Promise<Service> {
  const response = await apiRequest<APIResponse<Service>>(
    `/api/admin/services/${id}`
  );
  return response.data;
}

/**
 * Create a new service
 */
export async function createService(payload: CreateServicePayload): Promise<Service> {
  const response = await apiRequest<APIResponse<Service>>(
    '/api/admin/services',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Create multiple services
 */
export async function createBulkServices(
  payloads: CreateServicePayload[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/services/bulk',
    {
      method: 'POST',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Update a service
 */
export async function updateService(
  id: string,
  payload: UpdateServicePayload
): Promise<Service> {
  const response = await apiRequest<APIResponse<Service>>(
    `/api/admin/services/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

/**
 * Update multiple services
 */
export async function updateBulkServices(
  payloads: (UpdateServicePayload & { id: string })[]
): Promise<{ count: number }> {
  const response = await apiRequest<APIResponse<{ count: number }>>(
    '/api/admin/services/bulk',
    {
      method: 'PUT',
      body: JSON.stringify(payloads),
    }
  );
  return response.data;
}

/**
 * Delete a service
 */
export async function deleteService(id: string): Promise<{ message: string }> {
  const response = await apiRequest<APIResponse<{ message: string }>>(
    `/api/admin/services/${id}`,
    {
      method: 'DELETE',
    }
  );
  return response.data;
}
