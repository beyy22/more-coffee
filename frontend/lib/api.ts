const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: any;
  token?: string; // Optional manual token override
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, token: manualToken } = options;
  
  // Get token from localStorage (client side)
  let token = manualToken;
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token') || '';
  }

  const isFormData = body instanceof FormData;

  const config: RequestInit = {
    method,
    headers: {
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      // Don't set Content-Type for FormData, browser sets it with boundary
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  };

  /* 
   * Add cache: 'no-store' to prevent browser caching of API responses.
   * This ensures we always get fresh data from the server, especially after deletions.
   */
  const fetchConfig: RequestInit = {
    ...config,
    cache: 'no-store', 
    headers: {
        ...config.headers,
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, fetchConfig);
    
    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
      throw new Error(data.message || 'API Request Failed');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Network Error');
  }
}
