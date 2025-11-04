import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误和成功信息当用户开始输入时
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 前端验证
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('新密码和确认密码不匹配');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('新密码至少需要6个字符');
      return;
    }

    setIsLoading(true);

    try {
      // 这里调用修改密码的API
      // 假设有一个 changePassword API 函数
      // await changePassword({
      //   current_password: formData.currentPassword,
      //   new_password: formData.newPassword
      // });

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('密码修改成功！');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // 3秒后跳转回首页
      setTimeout(() => {
        nav('/');
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || '修改密码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jiraLight py-8">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-8 px-4">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">修改密码</h1>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mx-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 当前密码 */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                当前密码
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors"
                placeholder="请输入当前密码"
              />
            </div>

            {/* 新密码 */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors"
                placeholder="请输入新密码（至少6位）"
              />
            </div>

            {/* 确认新密码 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jiraBlue focus:border-jiraBlue transition-colors"
                placeholder="请再次输入新密码"
              />
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* 成功信息 */}
            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
                <div className="text-xs text-green-600 mt-1">3秒后自动返回首页...</div>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jiraBlue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiraBlue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '修改中...' : '修改密码'}
            </button>
          </form>

          {/* 密码要求提示 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">密码要求：</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 至少6个字符</li>
              <li>• 建议使用字母、数字和特殊字符组合</li>
              <li>• 不要使用过于简单的密码</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;