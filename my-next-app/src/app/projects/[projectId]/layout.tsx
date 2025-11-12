'use client';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams();
  const pathname = usePathname(); // 当前路由路径（例如：/projects/1/sprint）
  if (!projectId) return null;

  // 高亮样式（复用）
  const activeClass = "mr-6 px-2 py-1 text-blue-600 border-b-2 border-blue-600 font-medium whitespace-nowrap";
  const defaultClass = "mr-6 px-2 py-1 text-gray-600 hover:text-blue-600 whitespace-nowrap";

  return (
    <div className={inter.className}>
      <nav className="flex border-b border-gray-200 bg-white px-4 0.75 py-3 overflow-x-auto">
        {/* 1. Board：路径包含 /projects/${projectId} 且不包含子路径时高亮 */}
        <Link 
          href={`/projects/${projectId}`} 
          className={pathname === `/projects/${projectId}` ? activeClass : defaultClass}
        >
          Board
        </Link>
        {/* 2. Sprint：路径包含 /sprint 时高亮 */}
        <Link 
          href={`/projects/${projectId}/sprint`} 
          className={pathname.includes('/sprint') ? activeClass : defaultClass}
        >
          Sprint
        </Link>
        {/* 3. Timeline：路径包含 /timeline 时高亮 */}
        <Link 
          href={`/projects/${projectId}/timeline`} 
          className={pathname.includes('/timeline') ? activeClass : defaultClass}
        >
          Timeline
        </Link>
        {/* 4. Burndown：路径包含 /burndown 时高亮 */}
        <Link 
          href={`/projects/${projectId}/burndown`} 
          className={pathname.includes('/burndown') ? activeClass : defaultClass}
        >
          Burndown
        </Link>
        {/* 5. Summary：路径包含 /summary 时高亮（移除最后一个的margin） */}
        <Link 
          href={`/projects/${projectId}/summary`} 
          className={pathname.includes('/summary') 
            ? activeClass.replace('mr-6', '') 
            : defaultClass.replace('mr-6', '')}
        >
          Summary
        </Link>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}