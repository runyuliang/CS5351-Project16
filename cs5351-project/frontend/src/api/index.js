// src/api/index.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  // 同时检查 localStorage 和 sessionStorage
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  console.log('🔐 API 请求拦截器 - 找到 Token:', token ? '是' : '否')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('✅ 已添加 Authorization 头')
  } else {
    console.log('❌ 未找到 Token')
  }
  return config
})

// 添加响应拦截器用于调试
api.interceptors.response.use(
  (response) => {
    console.log('✅ API 响应成功:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ API 响应错误:', error.config?.url, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default api