import React from "react";
import { User } from "lucide-react";
import { motion } from "framer-motion";

export default function Card({ card, currentColId, allCols, onMoveCard }){
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      drag="y"
      dragConstraints={{ top: -8, bottom: 8 }}
      className="bg-white border rounded p-3 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-sm">{card.title}</div>
          <div className="text-xs text-gray-500 mt-1">指派：{card.assignee}</div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={() => {
              const idx = allCols.findIndex(c => c.id === currentColId);
              const next = allCols[(idx + 1) % allCols.length];
              onMoveCard(card.id, currentColId, next.id);
            }}
          >
            移动
          </button>
          <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}