import React from "react";
import { Layout, Square, Users, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

/*
  侧边栏：列出看板、收藏等
*/
const boards = [
  { id: 1, name: "产品看板", icon: Layout },
  { id: 2, name: "迭代任务", icon: Square },
  { id: 3, name: "团队看板", icon: Users },
];

export default function Sidebar(){
  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <div className="bg-jiraBlue text-white rounded px-2 py-1 font-bold">CityU</div>
        <div className="text-lg font-semibold">CityU ProjectHub</div>
      </div>

      <nav className="p-3">
        <div className="text-xs text-gray-400 px-3 mb-2">看板</div>
        <ul className="space-y-1">
          {boards.map(b => {
            const Icon = b.icon;
            return (
              <li key={b.id}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full text-left px-3 py-2 flex items-center gap-3 rounded hover:bg-gray-50"
                >
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{b.name}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-3 border-t">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2">
          <Bookmark className="w-4 h-4" /> 收藏
        </button>
      </div>
    </aside>
  );
}