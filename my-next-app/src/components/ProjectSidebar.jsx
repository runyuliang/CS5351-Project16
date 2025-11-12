"use client";
import Link from "next/link";

/**
 * 可复用的侧边栏组件
 * @param {Object} props - 组件属性
 * @param {Array} props.allProjects - 所有项目列表，每个项目需包含 id 和 name 属性
 * @param {string|null} props.currentProjectId - 当前选中项目的 ID，用于高亮显示
 * @returns {JSX.Element} 侧边栏组件
 */
export default function Sidebar({ allProjects, currentProjectId }) {
  return (
    <div className="w-36 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      {/* 返回仪表盘链接 */}
      <div className="mb-6">
        <Link href="/dashboard">
          <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
            ← 返回仪表盘
          </button>
        </Link>
      </div>
      
      {/* 项目列表标题 */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">我的项目</h2>
      
      {/* 项目列表 */}
      <ul className="space-y-1">
        {allProjects.map(proj => (
          <li key={proj.id}>
            <Link
              href={`/projects/${proj.id}`}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                proj.id === currentProjectId
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {proj.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}