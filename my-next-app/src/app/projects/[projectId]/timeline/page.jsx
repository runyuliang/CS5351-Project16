'use client';
import { useParams } from 'next/navigation';
import ProjectSidebar from '@/components/ProjectSidebar';

export default function TimelinePage() {
  const { projectId } = useParams();
  
  // 复用项目数据（和Sprint保持一致，实际项目中可统一从API获取）
  const allProjects = [

  ];
  
  return (
    <div className="flex">
      <ProjectSidebar 
        allProjects={allProjects} 
        currentProjectId={projectId} 
      />
      <div className="flex-1">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Timeline 页面</h1>
          <p className="text-gray-500">此页面功能待开发...</p>
        </div>
      </div>
    </div>
  );
}