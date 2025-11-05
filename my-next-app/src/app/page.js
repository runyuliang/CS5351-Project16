'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage获取用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8 text-center">
              {loading ? (
                  <p className="text-gray-500">Loading...</p>
              ) : user ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to my-next-app
                    </h2>
                    <p className="text-gray-600">
                      You are signed in as {user.email}
                    </p>
                    <p className="text-gray-600 mt-2">
                      Role: {user.role}
                    </p>
                    <div className="mt-6">
                      <Link
                          href="/dashboard"
                          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  </div>
              ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to my-next-app
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