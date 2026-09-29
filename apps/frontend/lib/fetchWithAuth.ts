import { API_URL } from "./api";

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * Fetch با authentication خودکار
 * Token را از localStorage می‌گیرد و به Authorization header اضافه می‌کند
 */
export async function fetchWithAuth(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { token: customToken, headers: customHeaders, ...rest } = options;
  
  let token = customToken;
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('token') || localStorage.getItem('blueframe_token');
  }
  
  const headers = new Headers(customHeaders);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(rest.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  return fetch(url, {
    ...rest,
    headers,
  });
}
