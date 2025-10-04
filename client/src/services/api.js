// src/services/api.js
const API_BASE_URL ='https://medical-shop-backend-v1u1.onrender.com/api'; // ⚠️ جای این آدرس، آدرس واقعی بک‌اند Render رو بذار

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      
      // نمایش جزئیات خطا در کنسول
      console.error('API Error:', {
        url: `${API_BASE_URL}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err) {
    // نمایش خطا در کنسول
    console.error('Fetch Error:', err);
    throw err;
  }
};

export default api;