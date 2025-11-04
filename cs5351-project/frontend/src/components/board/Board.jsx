import React, { useState } from "react";
import Column from "./Column";

/*
  Board 示例数据与简单移动逻辑（演示用）
  建议在真实项目中把数据放到全局状态并通过 API 同步
*/
const initial = [
  {
    id: "col-1",
    title: "待办",
    cards: [
      { id: "c1", title: "设计首页原型", assignee: "李" },
      { id: "c2", title: "搭建 CI 流程", assignee: "王" },
    ],
  },
  {
    id: "col-2",
    title: "进行中",
    cards: [
      { id: "c3", title: "实现登录接口", assignee: "赵" },
    ],
  },
  {
    id: "col-3",
    title: "已完成",
    cards: [
      { id: "c4", title: "初始化仓库", assignee: "钱" },
    ],
  },
];

export default function Board(){
  const [cols, setCols] = useState(initial);

  // 示例：把卡片从一个列移到另一个列（前端内存）
  const moveCard = (cardId, fromColId, toColId) => {
    setCols(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const from = copy.find(c => c.id === fromColId);
      const to = copy.find(c => c.id === toColId);
      const idx = from.cards.findIndex(cc => cc.id === cardId);
      if (idx === -1) return prev;
      const [card] = from.cards.splice(idx, 1);
      to.cards.unshift(card);
      return copy;
    });
  };

  return (
    <div className="flex gap-4">
      {cols.map(col => (
        <Column key={col.id} column={col} allCols={cols} onMoveCard={moveCard} />
      ))}
    </div>
  );
}