import React from 'react'
import { logout } from '../utils/auth'

export default function DashboardPage(){
  const handleLogout = () =>{
    logout()
    window.location.href = '/login'
  }
  return (
    <div style={{padding:20}}>
      <h1>仪表盘（已登录）</h1>
      <p>这里是简化示例，用于展示登录后访问受保护页面。</p>
      <button onClick={handleLogout}>登出</button>
    </div>
  )
}