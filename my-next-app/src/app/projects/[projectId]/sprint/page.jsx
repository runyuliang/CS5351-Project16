'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function TaskCard({ task, onTitleChange, onStatusClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
  });

  const style = { transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.5 : 1, cursor: 'grab' };
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (title !== task.title) onTitleChange(task.id, title);
  };
  const handleKeyDown = (e) => { if (e.key === 'Enter') e.target.blur(); };

  return (
    <div ref={setNodeRef} style={style} className="mb-2 p-3 rounded border bg-white shadow hover:shadow-lg transition">
      <div {...attributes} {...listeners} onDoubleClick={handleDoubleClick} className="font-medium cursor-grab">
        {editing ? (
          <input
            className="w-full border px-1 py-0.5 rounded"
            value={title} autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : title}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onStatusClick(task); }}
        className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
      >
        {task.status || '未开始'}
      </button>
      {task.assignee && <div className="text-xs text-gray-500 mt-1">👤 {task.assignee.name}</div>}
    </div>
  );
}

function Column({ title, items, droppableId, onTaskTitleChange, onStatusClick }) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div ref={setNodeRef} className={`w-80 mr-4 p-3 rounded border ${isOver ? 'border-blue-400' : 'border-gray-200'} bg-gray-50`}>
      <div className="font-semibold mb-3">{title} ({items.length})</div>
      <div>
        {items.map((t) => (
          <TaskCard key={t.id} task={t} onTitleChange={onTaskTitleChange} onStatusClick={onStatusClick} />
        ))}
      </div>
    </div>
  );
}

export default function SprintPageClient() {
  const { projectId } = useParams();
  const pid = Number(projectId);

  const [sprints, setSprints] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSprintName, setNewSprintName] = useState('');
  const [dueDate, setDueDate] = useState(''); // 新增截止时间
  const [activeDrag, setActiveDrag] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const STATUS_TO_ORDER = {
    "未开始": 1,
    "进行中": 2,
    "审核中": 3,
    "完成": 4,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${pid}/sprint?userId=1`);
      const json = await res.json();
      const formatTask = (task) => ({ ...task, id: String(task.id) });
      setSprints((json.sprints || []).map((s) => ({ ...s, tasks: (s.tasks || []).map(formatTask) })));
      setBacklog((json.backlog || []).map(formatTask));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleTaskTitleChange = async (taskId, newTitle) => {
    setBacklog(prev => prev.map(t => t.id === taskId ? { ...t, title: newTitle } : t));
    setSprints(prev => prev.map(s => ({ ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t) })));
    try {
      await fetch(`/api/projects/${pid}/board/tasks/${taskId}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: newTitle, userId: 1 }) 
      });
    } catch (err) { console.error(err); }
  };

  const assignTaskToSprint = async (taskId, sprintId) => { 
    try { 
      const res = await fetch(`/api/projects/${pid}/sprint/assign`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ taskId, sprintId }) 
      }); 
      if (!res.ok) throw new Error('任务分配失败'); 
      await fetchData(); 
    } catch (err) { console.error(err); } 
  };

  const onDragStart = (event) => setActiveDrag(event.active);
  const onDragEnd = (event) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = String(active.id);
    if (!activeId.startsWith('task-')) return;
    const taskId = Number(activeId.split('-')[1]);
    let sprintId = null;
    if (over.id === 'backlog') sprintId = null;
    else if (over.id.startsWith('sprint-')) sprintId = Number(over.id.split('-')[1]);
    else return;
    void assignTaskToSprint(taskId, sprintId);
  };

  const handleStatusClick = (task) => { setCurrentTask(task); setModalOpen(true); };

  const handleStatusSave = async () => {
    if (!currentTask) return;
  
    const newOrder = STATUS_TO_ORDER[currentTask.status];
  
    // 1. 根据状态找到 column slug
    const columnSlug = STATUS_TO_ORDER[newOrder];
  
    // 2. 找到该 column 的 columnId
    const resColumns = await fetch(`/api/projects/${pid}/board/columns?userId=1`);
    const allColumns = await resColumns.json();
    
    console.log(newOrder)
    console.log(currentTask.id)
    
  
    try {
      // 更新任务 status 本身
      const res = await fetch(`/api/projects/${pid}/board/tasks/${currentTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, status: currentTask.status }),
      });
  
      if (!res.ok) throw new Error("状态更新失败");
  
      // 调 reorder API，放到该 column 最底部
      await fetch(`/api/projects/${pid}/board/tasks/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          updates: [
            {
              columnId: newOrder,
              taskIds: [Number(currentTask.id)], // 放该 column 最底部
            },
          ],
        }),
      });
  
      await fetchData();
      setModalOpen(false);
      setCurrentTask(null);
  
    } catch (err) {
      console.error(err);
      alert("修改状态失败");
    }
  };

  const handleCreateSprint = async () => {
    if (!newSprintName.trim()) return alert('请输入 Sprint 名称');
    try {
      const res = await fetch(`/api/projects/${pid}/sprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSprintName, 
          dueDate: dueDate ? new Date(dueDate).toISOString() : null 
        }),
      });
      if (!res.ok) throw new Error('创建失败');
      setNewSprintName('');
      setDueDate('');
      await fetchData();
    } catch (err) { console.error(err); alert('创建 Sprint 失败'); }
  };

  const handleSprintStatusChange = async (sprintId, status) => {
    try {
      const res = await fetch(`/api/projects/${pid}/sprint/${sprintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('更新失败');
      await fetchData();
    } catch (err) { console.error(err); alert('更新 Sprint 状态失败'); }
  };

  

  return (
    <div className="flex h-screen p-6 bg-gray-100">
      <div className="w-72 mr-6">
        <h2 className="font-semibold text-lg mb-3">Backlog</h2>
        <div className="mb-4 flex flex-col">
          <input className="w-full mb-2 px-2 py-1 border rounded" placeholder="新 Sprint 名称" value={newSprintName} onChange={(e) => setNewSprintName(e.target.value)} />
          <input type="datetime-local" className="w-full mb-2 px-2 py-1 border rounded" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <button onClick={handleCreateSprint} className="w-full py-2 rounded bg-blue-600 text-white mb-2">创建 Sprint</button>
        </div>
      </div>

      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <div className="flex-1 overflow-x-auto flex space-x-4">
          <Column droppableId="backlog" title="Backlog" items={backlog} onTaskTitleChange={handleTaskTitleChange} onStatusClick={handleStatusClick} />
          {loading ? <div>加载中...</div> : sprints.map((s) => (
            <div key={s.id} id={`sprint-${s.id}`} className="p-2 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{s.name} #{s.order} {s.dueDate ? `- 截止: ${new Date(s.dueDate).toLocaleString()}` : ''}</span>
                <select
                  value={s.status}
                  onChange={(e) => handleSprintStatusChange(s.id, e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                >
                  <option value="未开始">未开始</option>
                  <option value="正在冲刺">正在冲刺</option>
                  <option value="完成">完成</option>
                </select>
              </div>
              <Column droppableId={`sprint-${s.id}`} title="" items={s.tasks} onTaskTitleChange={handleTaskTitleChange} onStatusClick={handleStatusClick} />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeDrag?.data?.current?.task && (
            <div className="w-64 p-3 bg-white rounded shadow">{activeDrag.data.current.task.title}</div>
          )}
        </DragOverlay>
      </DndContext>

      {modalOpen && currentTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-4 rounded shadow w-80">
            <h3 className="font-semibold mb-2">修改任务状态</h3>
            <select
              value={currentTask.status || '未开始'}
              onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
              className="w-full border rounded px-2 py-1 mb-4"
            >
              <option value="未开始">To do</option>
              <option value="进行中">In Progress</option>
              <option value="审核中">In Review</option>
              <option value="完成">Done</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setModalOpen(false)}>取消</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={handleStatusSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
