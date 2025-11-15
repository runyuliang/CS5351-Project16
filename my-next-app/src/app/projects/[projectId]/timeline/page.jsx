'use client';
import { useParams } from 'next/navigation';
import ProjectSidebar from '@/components/ProjectSidebar';
import Timeline from '@/components/Timeline';
import { useState, useEffect } from 'react';

export default function TimelinePage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setError('无效的项目 ID');
      setLoading(false);
      return;
    }

    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用正确的 API 端点
      const res = await fetch(`/api/projects/${projectId}`);

      if (!res.ok) {
        throw new Error(`API 请求失败: ${res.status}`);
      }

      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">错误</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProjectData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <ProjectSidebar currentProjectId={projectId} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {project?.name ? `${project.name} - Timeline` : 'Timeline'}
          </h1>
          <p className="text-gray-600 mt-2">
            项目时间线和任务排期视图
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <Timeline projectId={projectId} />
        </div>

        {/* 统计信息 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">总任务数</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">即将到期</h3>
            <p className="text-2xl font-bold text-orange-600">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">已完成</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}