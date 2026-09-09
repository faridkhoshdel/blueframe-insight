function getBackendUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://blueframe-backend.onrender.com';
  }
  const h = window.location.hostname;
  if (h === 'localhost') return 'http://localhost:50001';
  if (h.includes('frontend-demo')) {
    return 'https://blueframe-backend-demo.onrender.com';
  }
  return 'https://blueframe-backend.onrender.com';
}

export const API_URL = getBackendUrl();
export default API_URL;
