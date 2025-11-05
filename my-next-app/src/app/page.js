'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 这里可以添加获取当前用户状态的逻辑
    // 暂时设置为null，后续可以添加session管理
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // 这里可以添加退出登录的逻辑
    setUser(null);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Kanban Board</h1>
              </div>
              <nav className="flex items-center space-x-4">
                {user ? (
                    <>
                      <span className="text-gray-700">Welcome, {user.name}</span>
                      <button
                          onClick={handleLogout}
                          className="text-gray-600 hover:text-gray-900"
                      >
                        Sign out
                      </button>
                    </>
                ) : (
                    <>
                      <Link href="/login" className="text-gray-600 hover:text-gray-900">
                        Sign in
                      </Link>
                      <Link
                          href="/register"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                      >
                        Sign up
                      </Link>
                    </>
                )}
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8 text-center">
              {loading ? (
                  <p className="text-gray-500">Loading...</p>
              ) : user ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to Kanban Board
                    </h2>
                    <p className="text-gray-600">
                      You are signed in as {user.email}
                    </p>
                    <p className="text-gray-600 mt-2">
                      Role: {user.role}
                    </p>
                  </div>
              ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to Kanban Board
                    </h2>
                    <p className="text-gray-600 mb-6">
                      A Jira-like kanban tool for project management
                    </p>
                    <div className="space-x-4">
                      <Link
                          href="/register"
                          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                      >
                        Get Started
                      </Link>
                      <Link
                          href="/login"
                          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}