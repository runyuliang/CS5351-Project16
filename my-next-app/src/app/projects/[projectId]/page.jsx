"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// 拖拽依赖（正确导入）
import { DndContext, DragOverlay, DragEndEvent } from "@dnd-kit/core";
import { useSortable, SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const router = useRouter();

  // 状态管理 - 新增：选中任务状态（控制详情模态框）
  const [user, setUser] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [statuses, setStatuses] = useState([
    { id: "todo", name: "Todo", tasks: [] },
    { id: "inProgress", name: "In Progress", tasks: [] },
    { id: "inReview", name: "In Review", tasks: [] },
    { id: "done", name: "Done", tasks: [] },
  ]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    statusId: null,
    tags: ""
  });
  const [newStatusName, setNewStatusName] = useState("");
  const [activeTask, setActiveTask] = useState(null); // 仅用于拖拽悬浮层显示
  const [selectedTask, setSelectedTask] = useState(null); // 新增：存储当前选中的任务
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化：登录验证 + 加载数据
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);

    // 从后端加载项目数据
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/user/projects", { method: "POST" });
        const data = await res.json();
        setAllProjects(data.projects || []);
      } catch (err) {
        console.error("加载项目列表失败:", err);
      }
    };

    fetchProjects();

    // 从后端加载看板数据
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        const projectIdInt = parseInt(projectId, 10);
        const res = await fetch(`/api/project/${projectIdInt}/tasks`);
        
        if (!res.ok) {
          throw new Error("加载看板数据失败");
        }
        
        const data = await res.json();
        setStatuses(data.statuses || []);
        setError(null);
      } catch (err) {
        console.error("加载看板数据失败:", err);
        setError(err.message);
        // 如果后端加载失败，使用空的状态
        setStatuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [projectId, router]);

  // 自动保存到本地存储（无改动）
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`board_${projectId}`, JSON.stringify(statuses));
    }
  }, [statuses, projectId]);

  // 拖拽结束逻辑 - 连接到后端更新任务状态
  const handleDragEnd = async (event) => {
    const activeData = event.active.data.current;
    const overData = event.over?.data.current;

    if (!activeData?.task || !activeData?.statusId || !event.over) {
      setActiveTask(null);
      return;
    }

    let targetStatusId;
    if (overData?.statusId) {
      targetStatusId = overData.statusId;
    } else if (event.over.id) {
      targetStatusId = event.over.id;
    } else {
      setActiveTask(null);
      return;
    }

    // 如果目标状态和原状态相同，不进行任何操作
    if (targetStatusId === activeData.statusId) {
      setActiveTask(null);
      return;
    }

    try {
      const projectIdInt = parseInt(projectId, 10);
      const taskId = activeData.task.id;
      
      // 调用后端 API 更新任务状态
      const res = await fetch(`/api/project/${projectIdInt}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId: targetStatusId })
      });

      if (!res.ok) {
        throw new Error("更新任务状态失败");
      }

      // 前端状态同步
      const newStatuses = statuses.map(s => ({
        ...s,
        tasks: [...s.tasks]
      }));

      const sourceCol = newStatuses.find(s => s.id === activeData.statusId);
      const targetCol = newStatuses.find(s => s.id === targetStatusId);
      if (!sourceCol || !targetCol) {
        setActiveTask(null);
        return;
      }

      const taskIndex = sourceCol.tasks.findIndex(t => t.id === activeData.task.id);
      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

      if (overData?.taskId) {
        const targetTaskIndex = targetCol.tasks.findIndex(t => t.id === overData.taskId);
        targetCol.tasks.splice(targetTaskIndex, 0, movedTask);
      } else {
        targetCol.tasks.push(movedTask);
      }

      setStatuses(newStatuses);
    } catch (err) {
      console.error("更新任务状态失败:", err);
      alert("更新任务状态失败：" + err.message);
    } finally {
      setActiveTask(null);
    }
  };

  // 拖拽开始逻辑（无改动）
  const handleDragStart = (task) => {
    setActiveTask(task);
  };

  // 创建任务 - 连接到后端
  const createTask = async () => {
    if (!newTask.title.trim()) {
      alert("请输入任务标题！");
      return;
    }
    
    if (!newTask.statusId) {
      alert("请选择状态列！");
      return;
    }

    try {
      const tags = newTask.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);

      const projectIdInt = parseInt(projectId, 10);
      const res = await fetch(`/api/project/${projectIdInt}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          tags: [...new Set(tags)],
          statusId: parseInt(newTask.statusId, 10)
        })
      });

      if (!res.ok) {
        throw new Error("创建任务失败");
      }

      const createdTask = await res.json();
      
      // 更新前端状态
      setStatuses(prev => prev.map(status =>
        status.id === parseInt(newTask.statusId, 10)
          ? { ...status, tasks: [...status.tasks, createdTask] }
          : status
      ));
      
      setNewTask({ title: "", description: "", statusId: statuses.length > 0 ? statuses[0].id : null, tags: "" });
    } catch (err) {
      console.error("创建任务失败:", err);
      alert("创建任务失败：" + err.message);
    }
  };

  // 创建状态列 - 连接到后端
  const createStatus = async () => {
    if (!newStatusName.trim()) {
      alert("请输入状态列名称！");
      return;
    }

    try {
      const projectIdInt = parseInt(projectId, 10);
      const res = await fetch(`/api/project/${projectIdInt}/statuses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStatusName.trim() })
      });

      if (!res.ok) {
        throw new Error("创建状态列失败");
      }

      const newStatus = await res.json();
      newStatus.tasks = [];
      
      setStatuses([...statuses, newStatus]);
      setNewStatusName("");
    } catch (err) {
      console.error("创建状态列失败:", err);
      alert("创建状态列失败：" + err.message);
    }
  };

  // 新增：任务详情模态框组件
  const TaskDetailModal = ({ task, onClose }) => {
    if (!task) return null;

    // ESC键关闭模态框
    useEffect(() => {
      const handleKeyDown = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 text-xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
          
          {task.description ? (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">任务描述</h4>
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          ) : (
            <div className="mb-6 text-gray-500 text-sm italic">无任务描述</div>
          )}
          
          {task.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">标签</h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-400">
            创建时间：{task.createdAt}
          </div>
        </div>
      </div>
    );
  };

  // 任务组件（仅添加点击事件和鼠标样式）
  const TaskItem = ({ task, statusId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: `task_${task.id}`,
      data: {
        taskId: task.id,
        task,
        statusId
      }
    });

    return (
      <div
        // 新增：点击打开详情模态框（拖拽时不触发）
        onClick={(e) => !isDragging && setSelectedTask(task)}
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.4 : 1,
          cursor: isDragging ? "grabbing" : "pointer", // 改动：非拖拽时显示指针样式
          touchAction: "none"
        }}
        {...attributes}
        {...listeners}
        onDragStart={() => handleDragStart(task)}
        className="bg-white border border-gray-200 rounded-md p-4 mb-3 shadow-sm hover:shadow-md transition-all"
      >
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map(tag => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-2">{task.createdAt}</div>
      </div>
    );
  };

  // 状态列组件（无改动）
  const StatusColumn = ({ status }) => {
    const { setNodeRef, attributes } = useDroppable({
      id: status.id,
      data: { statusId: status.id }
    });

    return (
      <div className="w-80 flex-shrink-0 mr-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">{status.name}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {status.tasks.length}
          </span>
        </div>
        <div
          ref={setNodeRef}
          {...attributes}
          className="min-h-[500px] bg-gray-50 border border-gray-200 rounded-lg p-3 transition-all hover:border-gray-300"
          style={{
            padding: "0.75rem",
            boxSizing: "border-box"
          }}
        >
          <SortableContext
            items={status.tasks.map(t => `task_${t.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {status.tasks.map(task => (
              <TaskItem key={task.id} task={task} statusId={status.id} />
            ))}
          </SortableContext>
        </div>
      </div>
    );
  };

  // 检查当前项目
  const currentProject = allProjects.find(p => p.id.toString() === projectId);
  if (loading) return <div className="p-8 text-gray-500">加载看板数据中...</div>;
  if (error) return <div className="p-8 text-red-500">错误: {error}</div>;
  if (!currentProject && allProjects.length === 0) return <div className="p-8 text-gray-500">加载项目中...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* 左侧侧边栏（无改动） */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
              ← 返回仪表盘
            </button>
          </Link>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">我的项目</h2>
        <ul className="space-y-1">
          {allProjects.map(proj => (
            <li key={proj.id}>
              <Link
                href={`/projects/${proj.id}`}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  proj.id === projectId
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

      {/* 主看板区域 */}
      <div className="flex-1 overflow-x-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{currentProject ? currentProject.name : "项目看板"} - 项目看板</h1>

        <div className="mb-8 space-y-6">
          {statuses.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
              <p className="text-sm">👋 欢迎！请先添加至少一个状态列来开始使用看板。</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="添加新状态列（如：待测试）"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createStatus}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              添加状态列
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">任务标题 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="输入标题..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">描述（可选）</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="任务详情..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">标签（可选，逗号分隔）</label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  placeholder="如：bug,前端,紧急"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">添加到列 <span className="text-red-500">*</span></label>
                <select
                  value={newTask.statusId || ""}
                  onChange={(e) => setNewTask({ ...newTask, statusId: parseInt(e.target.value, 10) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={statuses.length === 0}
                >
                  <option value="">-- 请选择状态列 --</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
                <button
                  onClick={createTask}
                  disabled={statuses.length === 0}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  创建任务
                </button>
              </div>
            </div>
          </div>
        </div>

        <DndContext
          onDragStart={(e) => {
            const task = e.active.data.current?.task;
            if (task) setActiveTask(task);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTask(null)}
        >
          <div className="flex gap-2 overflow-x-auto pb-8">
            <SortableContext
              items={statuses.map(s => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              {statuses.map(status => (
                <StatusColumn key={status.id} status={status} />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="w-72 shadow-xl z-50">
                <TaskItem task={activeTask} statusId="" />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 新增：任务详情模态框（在最外层渲染，确保层级最高） */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}