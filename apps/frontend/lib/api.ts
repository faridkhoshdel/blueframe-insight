// تشخیص هوشمند URL بک‌اند در runtime
function detectApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Production: روی Render یا Vercel
    if (hostname.includes('onrender.com') || hostname.includes('vercel.app')) {
      return 'https://blueframe-backend.onrender.com';
    }
  }
  // Development: localhost
  return `${API_URL}`;
}

export const API_URL = detectApiUrl();
export default API_URL;
