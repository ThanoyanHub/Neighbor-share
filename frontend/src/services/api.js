import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' });
api.interceptors.request.use(config => { const token = localStorage.getItem('accessToken'); if (token) config.headers.Authorization = 'Bearer ' + token; return config; });
api.interceptors.response.use(r => r, async error => {
  const original = error.config;
  if (error.response?.status === 401 && !original?._retry && localStorage.getItem('refreshToken')) {
    original._retry = true;
    const { data } = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/auth/refresh', { refresh_token: localStorage.getItem('refreshToken') });
    localStorage.setItem('accessToken', data.access_token); localStorage.setItem('refreshToken', data.refresh_token);
    original.headers.Authorization = 'Bearer ' + data.access_token;
    return api(original);
  }
  return Promise.reject(error);
});
export default api;
