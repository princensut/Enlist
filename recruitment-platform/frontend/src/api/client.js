const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://enlist-five.vercel.app/api';

export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Fallback for browsers that block third-party cookies
  const savedToken = localStorage.getItem('access_token');
  if (savedToken) defaultHeaders.Authorization = `Bearer ${savedToken}`;

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Crucial for sending/receiving HttpOnly cookies
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const newToken = response.headers.get('X-Access-Token');
    if (newToken) localStorage.setItem('access_token', newToken);
    if (endpoint === '/auth/logout') localStorage.removeItem('access_token');
    if (response.status === 401 && endpoint !== '/auth/login') localStorage.removeItem('access_token');
    
    // Handle CSV download directly
    if (options.responseType === 'blob') {
      if (!response.ok) throw new Error('Failed to download file');
      return await response.blob();
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
  let errorMsg = 'An unexpected error occurred';

  if (typeof data.detail === 'string') {
    errorMsg = data.detail;
  } else if (Array.isArray(data.detail)) {
    errorMsg = data.detail
      .map((err) => err.msg || 'Validation error')
      .join(', ');
  } else if (typeof data.message === 'string') {
    errorMsg = data.message;
  }

  throw new Error(errorMsg);
}

    return data;
  } catch (error) {
    throw error;
  }
}