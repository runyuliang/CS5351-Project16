'use client';
import { useParams } from 'next/navigation';
import ProjectSidebar from '@/components/ProjectSidebar';
import Timeline from '@/components/Timeline';
import { useState, useEffect } from 'react';

export default function TimelinePage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    }
  };

  return (
    <div className="flex">
      <ProjectSidebar
        currentProjectId={projectId}
      />
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
