import api from './index'

export const register = (payload) => api.post('/api/v1/auth/register', payload)
export const login = (payload) => api.post('/api/v1/auth/login', payload)
export const changePassword = (payload) => api.post('/api/v1/auth/change-password', payload)