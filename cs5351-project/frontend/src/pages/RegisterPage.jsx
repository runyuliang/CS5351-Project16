// src/pages/RegisterPage.jsx
import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/auth'

export default function RegisterPage(){
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [email,setEmail] = useState('')
  const [error,setError] = useState('')
  const nav = useNavigate()

  const handleLoginClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    nav('/login')
  }

  const submit = async (e) =>{
    e.preventDefault()

    // 前端验证 - 邮箱必填
    if (!username || !password || !email) {
      setError('请填写所有字段')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    try{
      // 构建注册数据
      const registerData = {
        username,
        password,
        email: email
      }

      await register(registerData)

      // 注册成功后不再保存用户信息到全局存储
      // 用户需要在登录后通过API获取自己的信息

      nav('/login')
    }catch(err){
      console.error('注册错误:', err)
      const errorDetail = err?.response?.data?.detail

      let errorMessage = '注册失败，请检查输入信息'

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
      } else if (err?.response?.status === 500) {
        errorMessage = err?.response?.data?.detail || '注册失败，请稍后重试'
      }

      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-jiraLight flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="mx-auto h-12 w-12 bg-jiraBlue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">SJ</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建新账户
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名 *
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱 *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jiraBlue focus:border-jiraBlue focus:z-10 sm:text-sm"
                placeholder="请输入邮箱"
                value={email}
                onChange={e=>{
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码 *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="6"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jiraBlue focus:border-jiraBlue focus:z-10 sm:text-sm"
                placeholder="请输入密码（至少6位）"
                value={password}
                onChange={e=>{
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
              />
              <p className="mt-1 text-xs text-gray-500">密码至少需要6个字符</p>
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
                  <h3 className="text-sm font-medium text-red-800">注册失败</h3>
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
              注册
            </button>
          </div>

          <div className="text-center relative z-50">
            <p className="text-sm text-gray-600 relative z-50">
              已有账号？
              <button
                onClick={handleLoginClick}
                className="font-medium text-jiraBlue hover:text-blue-500 ml-1 focus:outline-none cursor-pointer relative z-50"
                style={{ pointerEvents: 'auto' }}
              >
                立即登录
              </button>
            </p>
          </div>
        </form>

        {/* 注册要求提示 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">注册要求：</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 用户名：必填，唯一</li>
            <li>• 邮箱：必填，唯一，有效格式</li>
            <li>• 密码：至少6个字符</li>
          </ul>
        </div>
      </div>
    </div>
  )
}