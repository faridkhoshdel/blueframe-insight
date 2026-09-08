export const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:50001'
    : 'https://blueframe-backend.onrender.com';

export default API_URL;
