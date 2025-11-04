// src/pages/EditProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../api/index';
import { saveUserInfo } from '../utils/auth';

const EditProfilePage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('开始获取用户信息...');
        const response = await api.get('/api/v1/auth/me');
        console.log('用户信息响应:', response.data);

        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          bio: response.data.bio || ''
        });
      } catch (err) {
        console.error('获取用户信息失败:', err);
        if (err.response?.status === 401) {
          setError('登录已过期，请重新登录');
        } else {
          setError('获取用户信息失败: ' + (err.response?.data?.detail || err.message));
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email) {
      setError('用户名和邮箱为必填项');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入有效的手机号码');
      return;
    }

    setIsLoading(true);

    try {
      console.log('开始更新用户信息:', formData);
      const response = await api.put('/api/v1/auth/profile', formData);
      console.log('更新成功:', response.data);

      // 更新用户信息到存储
      saveUserInfo(response.data);

      setSuccess('个人信息更新成功！');
      setTimeout(() => nav(-1), 2000);
    } catch (err) {
      console.error('更新失败:', err);
      setError(err.response?.data?.detail || err.message || '更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-jiraLight py-8 flex items-center justify-center">
        <div className="text-center">加载用户信息中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jiraLight py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8 px-4">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">编辑个人信息</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mx-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名 *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱 *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors"
                placeholder="请输入邮箱"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors"
                placeholder="请输入手机号（可选）"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                住址
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors"
                placeholder="请输入住址（可选）"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                个人简介
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors resize-none"
                placeholder="请输入个人简介（可选）"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
                <div className="text-xs text-green-600 mt-1">2秒后自动返回...</div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => nav(-1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiraBlue transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jiraBlue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiraBlue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 mx-4 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">提示：</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 用户名和邮箱为必填项</li>
            <li>• 手机号格式：11位数字，以1开头</li>
            <li>• 个人信息将保存在服务器数据库</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;