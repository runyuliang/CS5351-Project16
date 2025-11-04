// src/components/layout/Header.jsx
import React from "react";
import { Search, Plus, Bell } from "lucide-react";
import { motion } from "framer-motion";
import UserDropdown from "./UserDropdown"; // 确保路径正确

export default function Header(){
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder="搜索任务、成员、issue..."
            className="pl-10 pr-4 py-2 rounded border bg-white text-sm w-96"
          />
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-jiraBlue text-white px-3 py-1 rounded">
            <Plus className="w-4 h-4" /> 新建
          </motion.button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />

        {/* 用户下拉菜单 */}
        <UserDropdown />
      </div>
    </header>
  );
}