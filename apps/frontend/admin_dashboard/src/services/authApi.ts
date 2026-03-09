import type { AuthResponse, LoginInput } from '../types/auth';

// Use IAM service URL from environment or default to localhost:3000
const IAM_BASE_URL = import.meta.env.VITE_IAM_BASE_URL || 'http://localhost:3000';

/**
 * Login user with email and password
 */
export async function loginApi(input: LoginInput): Promise<AuthResponse> {
  const response = await fetch(`${IAM_BASE_URL}/api/auth/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get current user info (requires authentication)
 */
export async function getMeApi() {
  const response = await fetch(`${IAM_BASE_URL}/api/auth/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get user info');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Logout user
 */
export async function logoutApi(): Promise<void> {
  const response = await fetch(`${IAM_BASE_URL}/api/auth/sign-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Logout failed');
  }
}
