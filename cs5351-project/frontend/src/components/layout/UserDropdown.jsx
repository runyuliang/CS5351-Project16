// src/components/layout/UserDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getUserInfo, getCurrentUserId } from '../../utils/auth';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const dropdownRef = useRef(null);
  const nav = useNavigate();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取用户信息
  useEffect(() => {
    const loadUserInfo = async () => {
      // 先从存储中获取
      const storedUserInfo = getUserInfo();
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
      } else {
        // 如果没有存储的信息，从API获取
        try {
          const api = await import('../../api/index');
          const response = await api.default.get('/api/v1/auth/me');
          const userData = response.data;
          setUserInfo({
            username: userData.username,
            email: userData.email
          });
        } catch (error) {
          console.error('获取用户信息失败:', error);
          // 如果API也失败，使用默认值
          setUserInfo({
            username: '用户',
            email: ''
          });
        }
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    nav('/change-password');
  };

  const handleEditProfile = () => {
    setIsOpen(false);
    nav('/edit-profile');
  };

  const username = userInfo?.username || '用户';
  const userInitial = username.charAt(0).toUpperCase();
  const email = userInfo?.email || '';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 用户头像触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-jiraBlue text-white rounded-full flex items-center justify-center text-sm font-medium">
          {userInitial}
        </div>
        <div className="text-sm text-gray-700">{username}</div>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* 用户信息区域 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-jiraBlue text-white rounded-full flex items-center justify-center text-lg font-bold">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {username}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {email}
                </div>
              </div>
            </div>
            <button
              onClick={handleEditProfile}
              className="text-sm text-jiraBlue hover:text-blue-700 font-medium focus:outline-none"
            >
              编辑个人信息
            </button>
          </div>

          {/* 操作按钮区域 */}
          <div className="p-2">
            <button
              onClick={handleChangePassword}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              修改密码
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;