function getBackendUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://blueframe-backend.onrender.com';
  }
  const h = window.location.hostname;
  
  // Development
  if (h === 'localhost' || h === '127.0.0.1') {
    return 'http://localhost:50001';
  }
  
  // Demo Frontend → Demo Backend
  if (h.includes('frontend-demo')) {
    return 'https://blueframe-backend-demo.onrender.com';
  }
  
  // Production Frontend → Production Backend
  return 'https://blueframe-backend.onrender.com';
}

export const API_URL = getBackendUrl();
export default API_URL;
