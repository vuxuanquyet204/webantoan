import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const registerUser = (payload) => api.post('/auth/register', payload);

export const loginUser = (payload) => api.post('/auth/login', payload);

export const fetchUsers = () => api.get('/auth/users');

export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

export const fetchWordlists = () => api.get('/crack/wordlists');

export const createCrackJob = (payload) => api.post('/crack/jobs', payload);

export const fetchCrackJobs = () => api.get('/crack/jobs');

export const fetchCrackJobById = (id) => api.get(`/crack/jobs/${id}`);

export const cancelCrackJob = (id) => api.post(`/crack/jobs/${id}/cancel`);

export const deleteCrackJob = (id) => api.delete(`/crack/jobs/${id}`);

export const deleteAllCrackJobs = () => api.delete('/crack/jobs');

export const fetchCrackStats = () => api.get('/crack/stats');

export default api;


