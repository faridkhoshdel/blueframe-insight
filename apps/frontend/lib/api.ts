import { API_URL } from '@/lib/api';
// URL بک‌اند - ساده و مطمئن
// اگر در localhost هستیم (development) از localhost استفاده کن
// در غیر این صورت (production) از Render backend استفاده کن
export const API_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:50001'
    : 'https://blueframe-backend.onrender.com';

export default API_URL;
