import React from 'react'
import { Navigate } from 'react-router-dom'
import { getToken, isRememberMe } from '../utils/auth'

const ProtectedRoute = ({children}) => {
  const token = getToken()

  // 如果没有 token，重定向到登录页
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // 如果有 token 但没有选择"保持登录"，且页面刷新后，重定向到登录页
  // 这样确保不保持登录的用户每次打开都是登录页
  if (!isRememberMe() && !sessionStorage.getItem('access_token')) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute