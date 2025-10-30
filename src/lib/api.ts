const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

const getValidAccessToken = async (): Promise<string | null> => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken) return null;

  // Check if token is expired (simple check, assumes JWT payload)
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();

    if (exp - now < 300000) { // If expires within 5 minutes
      if (!refreshToken) return null;

      const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem('accessToken', refreshData.access);
        return refreshData.access;
      } else {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
      }
    }
  } catch {
    return accessToken; // If can't decode, use as is
  }

  return accessToken;
};

export const apiRequest = async (url: string, options: ApiOptions = {}): Promise<Response> => {
  const { requireAuth = true, ...fetchOptions } = options;

  let headers = { ...fetchOptions.headers };

  if (requireAuth) {
    const accessToken = await getValidAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      // No token, redirect to login
      window.location.href = '/login';
      throw new Error('No access token');
    }
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers,
  });

  // If 401 and we tried, perhaps retry once
  if (response.status === 401 && requireAuth) {
    // Try refresh and retry
    const refreshedToken = await getValidAccessToken();
    if (refreshedToken) {
      headers['Authorization'] = `Bearer ${refreshedToken}`;
      return await fetch(fullUrl, {
        ...fetchOptions,
        headers,
      });
    }
  }

  return response;
};

/*
// Example usage:
const response = await apiRequest('/products/', { method: 'GET' });
if (response.ok) {
  const data = await response.json();
}
*/
