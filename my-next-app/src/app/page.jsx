"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 任务卡片组件
function TaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            编辑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-red-600 hover:text-red-800 text-xs"
          >
            删除
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded ${
            priorityColors[task.priority] || priorityColors.medium
          }`}
        >
          {task.priority === "low" && "低优先级"}
          {task.priority === "medium" && "中优先级"}
          {task.priority === "high" && "高优先级"}
        </span>

        {task.assignee && (
          <span className="text-xs text-gray-600">
            👤 {task.assignee.name || task.assignee.email}
          </span>
        )}
      </div>
    </div>
  );
}

// 看板列组件
function BoardColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask, onDeleteColumn }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 min-w-[300px] max-w-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          {column.name}
          <span className="text-sm font-normal text-gray-500">
            ({tasks.length})
          </span>
        </h3>
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          删除列
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      <button
        onClick={() => onAddTask(column.id)}
        className="mt-3 w-full py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        + 添加任务
      </button>
    </div>
  );
}

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id);

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // 模态框状态
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  // 表单状态
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "",
  });
  const [columnName, setColumnName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setCurrentUser(user);
    fetchBoard();
  }, [projectId, router]);

  const fetchBoard = async () => {
    try {
      const res = await fetch(`/api/board/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch board");
      const data = await res.json();
      setBoard(data);
    } catch (err) {
      console.error("Error fetching board:", err);
      alert("加载看板失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // 查找任务所在的列
    let sourceColumn = null;
    let targetColumn = null;
    let taskToMove = null;

    for (const col of board.columns) {
      const taskIndex = col.tasks.findIndex((t) => t.id === active.id);
      if (taskIndex !== -1) {
        sourceColumn = col;
        taskToMove = col.tasks[taskIndex];
        break;
      }
    }

    // 查找目标位置
    for (const col of board.columns) {
      const taskIndex = col.tasks.findIndex((t) => t.id === over.id);
      if (taskIndex !== -1) {
        targetColumn = col;
        break;
      }
    }

    if (!sourceColumn || !taskToMove) return;

    // 如果没找到目标任务，可能是拖到了列上
    if (!targetColumn) {
      targetColumn = sourceColumn;
    }

    const sourceTaskIndex = sourceColumn.tasks.findIndex((t) => t.id === active.id);
    const targetTaskIndex = targetColumn.tasks.findIndex((t) => t.id === over.id);

    // 计算新位置
    let newPosition = targetTaskIndex !== -1 ? targetTaskIndex : targetColumn.tasks.length;

    // 调用 API 移动任务
    try {
      const res = await fetch("/api/task/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: taskToMove.id,
          targetColumnId: targetColumn.id,
          targetPosition: newPosition,
          userId: currentUser.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to move task");

      // 重新获取看板数据
      await fetchBoard();
    } catch (error) {
      console.error("Error moving task:", error);
      alert("移动任务失败");
    }
  };

  const handleAddTask = (columnId) => {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setTaskForm({ title: "", description: "", priority: "medium", assigneeId: "" });
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setSelectedColumnId(task.columnId);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      assigneeId: task.assignee?.id || "",
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) {
      alert("请输入任务标题");
      return;
    }

    try {
      if (editingTask) {
        // 更新任务
        const res = await fetch("/api/task/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: editingTask.id,
            ...taskForm,
            userId: currentUser.id,
          }),
        });

        if (!res.ok) throw new Error("Failed to update task");
      } else {
        // 创建任务
        const res = await fetch("/api/task/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...taskForm,
            columnId: selectedColumnId,
            projectId,
            creatorId: currentUser.id,
          }),
        });

        if (!res.ok) throw new Error("Failed to create task");
      }

      await fetchBoard();
      setShowTaskModal(false);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("保存任务失败");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("确定要删除此任务吗？")) return;

    try {
      const res = await fetch("/api/task/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, userId: currentUser.id }),
      });

      if (!res.ok) throw new Error("Failed to delete task");

      await fetchBoard();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("删除任务失败");
    }
  };

  const handleAddColumn = async () => {
    if (!columnName.trim()) {
      alert("请输入列名称");
      return;
    }

    try {
      const res = await fetch("/api/column/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: columnName,
          projectId,
          userId: currentUser.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to create column");

      await fetchBoard();
      setShowColumnModal(false);
      setColumnName("");
    } catch (error) {
      console.error("Error creating column:", error);
      alert("创建列失败");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!confirm("确定要删除此列吗？列中的所有任务也会被删除。")) return;

    try {
      const res = await fetch("/api/column/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, userId: currentUser.id }),
      });

      if (!res.ok) throw new Error("Failed to delete column");

      await fetchBoard();
    } catch (error) {
      console.error("Error deleting column:", error);
      alert("删除列失败");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">加载中...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">看板不存在</p>
      </div>
    );
  }

  const activeTask = activeId
    ? board.columns.flatMap((col) => col.tasks).find((t) => t.id === activeId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 顶部导航 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/project/${projectId}`}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <span>←</span>
              <span>返回项目</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{board.name} - 看板</h1>
          </div>

          <button
            onClick={() => setShowColumnModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + 添加列
          </button>
        </div>

        {/* 看板区域 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {board.columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={column.tasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {board.columns.length === 0 && (
              <div className="text-center text-gray-500 py-20">
                <p className="mb-4">还没有看板列，点击右上角"添加列"开始创建</p>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-blue-500 opacity-90">
                <h4 className="font-semibold text-gray-900">{activeTask.title}</h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 任务模态框 */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask ? "编辑任务" : "创建任务"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务标题 *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="输入任务标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务描述
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                  placeholder="输入任务描述"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分配给
                </label>
                <select
                  value={taskForm.assigneeId}
                  onChange={(e) => setTaskForm({ ...taskForm, assigneeId: parseInt(e.target.value) || "" })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">未分配</option>
                  {board.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleSaveTask}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingTask ? "更新" : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 列模态框 */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold mb-4">添加列</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                列名称 *
              </label>
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="例如：待办、进行中、已完成"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowColumnModal(false);
                  setColumnName("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleAddColumn}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

