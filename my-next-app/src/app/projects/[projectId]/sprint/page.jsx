'use client';
import { useParams } from 'next/navigation';
import ProjectSidebar from '@/components/ProjectSidebar';

export default function SprintPage() {
  const { projectId } = useParams();
  
  // 模拟项目数据（实际项目中可从API获取）
  const allProjects = [

  ];
  
  return (
    <div className="flex">
      {/* 传递实际项目数据和当前项目ID */}
      <ProjectSidebar 
        allProjects={allProjects} 
        currentProjectId={projectId} 
      />
      
      <div className="flex-1">
        {/* 移除 ProjectNavbar，避免重复导航栏 */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Sprint 页面</h1>
          <p className="text-gray-500">此页面功能待开发...</p>
        </div>
      </div>
    </div>
  );
}