import React from "react";
import Card from "./Card";

/*
  Column：展示列头和卡片
*/
export default function Column({ column, allCols, onMoveCard }){
  return (
    <div className="w-80 bg-white rounded shadow-sm p-3 flex flex-col max-h-[70vh] overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <div className="text-xs text-gray-400">{column.cards.length} 条</div>
        </div>
      </div>

      <div className="space-y-3">
        {column.cards.map(card => (
          <Card
            key={card.id}
            card={card}
            currentColId={column.id}
            allCols={allCols}
            onMoveCard={onMoveCard}
          />
        ))}
      </div>
    </div>
  );
}