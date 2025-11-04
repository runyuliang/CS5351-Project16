// src/pages/LoginPage.jsx
import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { saveToken, saveUserInfo } from '../utils/auth'

export default function LoginPage(){
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error,setError] = useState('')
  const nav = useNavigate()

  const submit = async (e) =>{
    e.preventDefault()
    console.log('提交按钮被点击')

    try{
      console.log('开始登录请求', { username, password })

      const loginData = {
        username: username,
        password: password
      }

      console.log('发送的数据:', loginData)

      const res = await login(loginData)
      console.log('登录响应:', res.data)

      // 保存token
      if (rememberMe) {
        saveToken(res.data.access_token)
        localStorage.setItem('rememberMe', 'true')
      } else {
        sessionStorage.setItem('access_token', res.data.access_token)
        localStorage.removeItem('rememberMe')
      }

      // 获取用户信息并保存
      try {
        const api = await import('../api/index');
        const userResponse = await api.default.get('/api/v1/auth/me');
        const userData = userResponse.data;

        // 保存用户信息（使用用户ID作为前缀）
        saveUserInfo(userData);

        console.log('用户信息已保存:', userData);
      } catch (userError) {
        console.error('获取用户信息失败:', userError);
        // 如果获取用户信息失败，至少保存用户名
        saveUserInfo({ username, email: '' });
      }

      console.log('登录成功，跳转到首页')
      nav('/')
    }catch(err){
      console.error('登录错误:', err)
      const errorDetail = err?.response?.data?.detail

      let errorMessage = '登录失败'

      if (Array.isArray(errorDetail)) {
        errorMessage = errorDetail.map(item => {
          if (typeof item === 'string') return item
          if (typeof item === 'object' && item.msg) return item.msg
          return JSON.stringify(item)
        }).join(', ')
      } else if (typeof errorDetail === 'string') {
        errorMessage = errorDetail
      } else if (typeof errorDetail === 'object') {
        errorMessage = JSON.stringify(errorDetail)
      }

      setError(errorMessage)
    }
  }

  const handleRegisterClick = (e) => {
    e.preventDefault()
    nav('/register')
  }

  return (
    <div className="min-h-screen bg-jiraLight flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="mx-auto h-12 w-12 bg-jiraBlue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">SJ</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到您的账户
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jiraBlue focus:border-jiraBlue focus:z-10 sm:text-sm"
                placeholder="请输入用户名"
                value={username}
                onChange={e=>{
                  setUsername(e.target.value)
                  if (error) setError('')
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jiraBlue focus:border-jiraBlue focus:z-10 sm:text-sm"
                placeholder="请输入密码"
                value={password}
                onChange={e=>{
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
              />
            </div>

            {/* 保持登录选项 */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-jiraBlue focus:ring-jiraBlue border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                保持登录状态
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">登录失败</h3>
                  <div className="mt-1 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-jiraBlue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiraBlue transition-colors"
            >
              登录
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              没有账号？
              <button
                onClick={handleRegisterClick}
                className="font-medium text-jiraBlue hover:text-blue-500 ml-1 focus:outline-none cursor-pointer"
              >
                立即注册
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}