import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import EditProfilePage from './pages/EditProfilePage' // 新增导入
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage/></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage/></ProtectedRoute>} /> {/* 新增路由 */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)