import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || `${API_BASE_URL}/graphql`;

/**
 * Resolves auth token from client document.cookie or Next.js server cookie store
 */
export async function getAuthToken(): Promise<string | undefined> {
  // 1. Browser environment
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  // 2. Next.js SSR Server Component environment
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get('access_token')?.value;
    } catch {
      // Called outside request context or during static generation
    }
  }

  return undefined;
}

/**
 * Primary Axios instance configured for TechLearns API
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach Bearer token dynamically
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // If authorization header is not already set, attempt to resolve token
    if (!config.headers['Authorization']) {
      const token = await getAuthToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API error formatting
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
    
    // Create an enhanced Error with API response data attached
    const customError = new Error(Array.isArray(message) ? message.join(', ') : message);
    (customError as any).status = error.response?.status;
    (customError as any).data = error.response?.data;
    (customError as any).isAxiosError = true;
    return Promise.reject(customError);
  }
);

export default apiClient;
