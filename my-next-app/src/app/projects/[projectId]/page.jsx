"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const INITIAL_TASK_FORM = {
  title: "",
  description: "",
  statusId: "",
  tags: "",
  assignee: null,
  dueDate: null,
  estimatedHours: null,
};

const formatTask = (task) => {
  const createdAt =
    task?.createdAt != null
      ? new Date(task.createdAt).toLocaleString()
      : new Date().toLocaleString();

  return {
    id: task.id.toString(),
    numericId: Number(task.id),
    title: task.title,
    description: task.description || "",
    tags: Array.isArray(task.tags) ? task.tags : [],
    position: typeof task.position === "number" ? task.position : 0,
    createdAt,
    updatedAt: task.updatedAt,
    // 确保时间字段被正确处理
    dueDate: task.dueDate || task.due_date || null,  // 支持两种字段名
    estimatedHours: task.estimatedHours || task.estimated_hours || null,
    actualHours: task.actualHours || task.actual_hours || null,
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name:
            task.assignee.name ||
            task.assignee.email ||
            `用户${task.assignee.id}`,
          email: task.assignee.email || "",
        }
      : null,
  };
};

const formatColumn = (column) => ({
  id: `column-${column.id}`,
  columnId: Number(column.id),
  name: column.name,
  order: column.order,
  tasks: Array.isArray(column.tasks)
    ? column.tasks.map((task) => formatTask(task))
    : [],
});

// 时间编辑模态框组件
const TimeEditModal = ({ task, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    estimatedHours: task.estimatedHours || '',
    actualHours: task.actualHours || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const updatedTask = {
        ...task,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : null,
        actualHours: formData.actualHours ? Number(formData.actualHours) : null,
      };

      await onSave(updatedTask);
      onClose();
    } catch (error) {
      console.error("保存时间设置失败:", error);
      alert("保存失败，请重试");
    }
  };

  const handleClear = (field) => {
    setFormData({
      ...formData,
      [field]: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">设置时间</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* 截止时间 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  截止时间
                </label>
                {formData.dueDate && (
                  <button
                    type="button"
                    onClick={() => handleClear('dueDate')}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    清除
                  </button>
                )}
              </div>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 预估工时 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  预估工时 (小时)
                </label>
                {formData.estimatedHours && (
                  <button
                    type="button"
                    onClick={() => handleClear('estimatedHours')}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    清除
                  </button>
                )}
              </div>
              <input
                type="number"
                name="estimatedHours"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={handleChange}
                placeholder="输入预估工时"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 实际工时 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  实际工时 (小时)
                </label>
                {formData.actualHours && (
                  <button
                    type="button"
                    onClick={() => handleClear('actualHours')}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    清除
                  </button>
                )}
              </div>
              <input
                type="number"
                name="actualHours"
                min="0"
                step="0.5"
                value={formData.actualHours}
                onChange={handleChange}
                placeholder="输入实际工时"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProjectBoard() {
  const { projectId: routeProjectId } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [newTask, setNewTask] = useState(INITIAL_TASK_FORM);
  const [newStatusName, setNewStatusName] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [activeStatusId, setActiveStatusId] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [boardError, setBoardError] = useState("");
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, task: null, statusId: null });

  const projectIdNumber = Number(routeProjectId);

  const fetchBoardData = useCallback(
  async (projectId, userId) => {
    if (!projectId || !userId) {
      return;
    }

    setLoadingBoard(true);
    setBoardError("");

    try {
      const res = await fetch(
        `/api/projects/${projectId}/board?userId=${userId}`
      );
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "加载看板失败");
      }

      // 添加调试日志
      console.log('API返回的原始数据:', payload);

      const formattedColumns = (payload.columns || []).map((column) => {
          const formattedColumn = formatColumn(column);
          // 调试每个任务的时间数据
          formattedColumn.tasks.forEach(task => {
            console.log(`任务 "${task.title}" 的时间数据:`, {
              dueDate: task.dueDate,
              estimatedHours: task.estimatedHours,
              actualHours: task.actualHours
            });
          });
          return formattedColumn;
        }).sort((a, b) => a.order - b.order);

      setStatuses(formattedColumns);
    } catch (error) {
      console.error("加载看板失败：", error);
      setBoardError(error.message || "加载看板失败");
      setStatuses([]);
    } finally {
      setLoadingBoard(false);
    }
  },
  []
);

  const fetchUserProjects = useCallback(
    async (userData, targetProjectId) => {
      setLoadingProjects(true);
      setUsersLoading(true);
      try {
        const res = await fetch("/api/user/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData.id }),
        });

        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "获取项目失败");
        }

        const projects = (payload.projects || []).map((proj) => ({
          ...proj,
          id: proj.id.toString(),
          members: proj.members || [],
        }));

        setAllProjects(projects);

        const normalizedTarget =
          targetProjectId != null ? targetProjectId.toString() : null;
        const current =
          projects.find((proj) => proj.id === normalizedTarget) || null;

        setCurrentProject(current);

        if (current && current.members && current.members.length > 0) {
          setUsers(current.members);
        } else {
          setUsers([userData]);
        }

        if (current) {
          await fetchBoardData(Number(current.id), userData.id);
        } else {
          setStatuses([]);
          setLoadingBoard(false);
        }
      } catch (error) {
        console.error("获取项目失败：", error);
        setAllProjects([]);
        setCurrentProject(null);
        setUsers([userData]);
        setStatuses([]);
        setBoardError(error.message || "无法获取项目");
        setLoadingBoard(false);
      } finally {
        setLoadingProjects(false);
        setUsersLoading(false);
      }
    },
    [fetchBoardData]
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } catch (error) {
      console.error("解析用户信息失败：", error);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchUserProjects(user, routeProjectId);
  }, [user, routeProjectId, fetchUserProjects]);

  useEffect(() => {
    if (statuses.length === 0) {
      setNewTask((prev) => ({ ...prev, statusId: "" }));
      return;
    }

    setNewTask((prev) => {
      if (prev.statusId && statuses.some((status) => status.id === prev.statusId)) {
        return prev;
      }
      return { ...prev, statusId: statuses[0].id };
    });
  }, [statuses]);

  useEffect(() => {
    setNewTask((prev) => {
      if (!prev.assignee) return prev;
      const exists = users.some((member) => String(member.id) === String(prev.assignee.id));
      return exists ? prev : { ...prev, assignee: null };
    });
  }, [users]);

  const persistReorder = useCallback(
    async (updates) => {
      if (!user || !routeProjectId) return;

      try {
        const res = await fetch(
          `/api/projects/${routeProjectId}/board/tasks/reorder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              updates,
            }),
          }
        );
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "任务排序更新失败");
        }
      } catch (error) {
        console.error("任务排序更新失败：", error);
        alert(error.message || "任务排序更新失败");
        if (user && projectIdNumber) {
          await fetchBoardData(projectIdNumber, user.id);
        }
      }
    },
    [user, routeProjectId, fetchBoardData, projectIdNumber]
  );

  const persistAssignee = useCallback(
    async (taskId, assigneeId) => {
      if (!user || !routeProjectId) {
        throw new Error("用户未登录或项目不存在");
      }

      const res = await fetch(
        `/api/projects/${routeProjectId}/board/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            assigneeId:
              assigneeId === null || assigneeId === "" ? null : assigneeId,
          }),
        }
      );

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "更新任务失败");
      }

      return payload;
    },
    [user, routeProjectId]
  );

  // 处理时间保存
  // 处理时间保存
  const handleTimeSave = async (updatedTask) => {
  if (!user || !routeProjectId) {
    throw new Error("用户未登录或项目不存在");
  }

  const updateData = {
    userId: user.id,
  };

  if (updatedTask.dueDate !== undefined) {
    updateData.dueDate = updatedTask.dueDate;
  }
  if (updatedTask.estimatedHours !== undefined) {
    updateData.estimatedHours = updatedTask.estimatedHours;
  }
  if (updatedTask.actualHours !== undefined) {
    updateData.actualHours = updatedTask.actualHours;
  }

  console.log('发送的更新数据:', updateData);

  try {
    const res = await fetch(
      `/api/projects/${routeProjectId}/board/tasks/${task.numericId ?? task.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const payload = await res.json();
    console.log('服务器返回的数据:', payload);

    // 更新本地状态 - 使用 formatTask 确保数据格式一致
    const formattedTask = formatTask(payload);

    setStatuses((prev) =>
      prev.map((status) =>
        status.id === statusId
          ? {...status,
              tasks: status.tasks.map((item) =>
                item.id === task.id
                  ? {...item,
                      dueDate: formattedTask.dueDate,
                      estimatedHours: formattedTask.estimatedHours,
                      actualHours: formattedTask.actualHours,
                      updatedAt: formattedTask.updatedAt,
                    }
                  : item
              ),
            }
          : status
      )
    );

    return payload;
  } catch (error) {
    console.error("更新时间失败:", error);
    throw new Error("更新时间失败: " + error.message);
  }
};

  const handleDragEnd = (event) => {
    const activeData = event.active.data.current;
    const overData = event.over?.data.current;

    if (!activeData?.task || !activeData?.statusId || !event.over) {
      setActiveTask(null);
      setActiveStatusId("");
      return;
    }

    let targetStatusId = null;
    if (overData?.statusId) {
      targetStatusId = overData.statusId;
    } else if (event.over.id) {
      targetStatusId = event.over.id;
    }

    if (!targetStatusId) {
      setActiveTask(null);
      setActiveStatusId("");
      return;
    }

    const updatedStatuses = statuses.map((status) => ({
      ...status,
      tasks: [...status.tasks],
    }));

    const sourceStatus = updatedStatuses.find(
      (status) => status.id === activeData.statusId
    );
    const targetStatus = updatedStatuses.find(
      (status) => status.id === targetStatusId
    );

    if (!sourceStatus || !targetStatus) {
      setActiveTask(null);
      setActiveStatusId("");
      return;
    }

    const taskIndex = sourceStatus.tasks.findIndex(
      (task) => task.id === activeData.task.id
    );

    if (taskIndex < 0) {
      setActiveTask(null);
      setActiveStatusId("");
      return;
    }

    const [movedTask] = sourceStatus.tasks.splice(taskIndex, 1);

    if (overData?.taskId) {
      const targetIndex = targetStatus.tasks.findIndex(
        (task) => task.id === overData.taskId
      );
      if (targetIndex >= 0) {
        targetStatus.tasks.splice(targetIndex, 0, movedTask);
      } else {
        targetStatus.tasks.push(movedTask);
      }
    } else {
      targetStatus.tasks.push(movedTask);
    }

    sourceStatus.tasks = sourceStatus.tasks.map((task, index) => ({
      ...task,
      position: index,
    }));

    if (sourceStatus.id === targetStatus.id) {
      targetStatus.tasks = targetStatus.tasks.map((task, index) => ({
        ...task,
        position: index,
      }));
    } else {
      targetStatus.tasks = targetStatus.tasks.map((task, index) => ({
        ...task,
        position: index,
      }));
    }

    setStatuses(updatedStatuses);
    setActiveTask(null);
    setActiveStatusId("");

    const updatesPayload = [
      {
        columnId: sourceStatus.columnId,
        taskIds: sourceStatus.tasks.map((task) =>
          Number(task.numericId ?? task.id)
        ),
      },
    ];

    if (sourceStatus.id !== targetStatus.id) {
      updatesPayload.push({
        columnId: targetStatus.columnId,
        taskIds: targetStatus.tasks.map((task) =>
          Number(task.numericId ?? task.id)
        ),
      });
    }

    void persistReorder(updatesPayload);
  };

  const createStatus = async () => {
    if (!newStatusName.trim()) {
      alert("请输入状态列名称！");
      return;
    }
    if (!user || !routeProjectId) return;

    try {
      const res = await fetch(
        `/api/projects/${routeProjectId}/board/columns`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: newStatusName,
          }),
        }
      );
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "创建状态列失败");
      }

      const formatted = {
        id: `column-${payload.id}`,
        columnId: Number(payload.id),
        name: payload.name,
        order: payload.order,
        tasks: [],
      };

      setStatuses((prev) =>
        [...prev, formatted].sort((a, b) => a.order - b.order)
      );
      setNewStatusName("");
    } catch (error) {
      console.error("创建状态列失败：", error);
      alert(error.message || "创建状态列失败");
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      alert("请输入任务标题！");
      return;
    }
    if (!user || !routeProjectId) return;

    const targetStatus = statuses.find(
      (status) => status.id === newTask.statusId
    );

    if (!targetStatus) {
      alert("请选择有效的状态列");
      return;
    }

    const tags = newTask.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const requestData = {
      userId: user.id,
      columnId: targetStatus.columnId,
      title: newTask.title,
      description: newTask.description,
      tags,
      assigneeId: newTask.assignee?.id ?? null,
    };

    if (newTask.dueDate) {
      requestData.dueDate = newTask.dueDate;
    }
    if (newTask.estimatedHours) {
      requestData.estimatedHours = Number(newTask.estimatedHours);
    }

    try {
      const res = await fetch(`/api/projects/${routeProjectId}/board/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const payload = await res.json();

      const formattedTask = formatTask(payload);

      setStatuses((prev) =>
        prev.map((status) =>
          status.id === targetStatus.id
            ? { ...status, tasks: [...status.tasks, formattedTask] }
            : status
        )
      );

      setNewTask({
        ...INITIAL_TASK_FORM,
        statusId: targetStatus.id,
      });
    } catch (error) {
      console.error("创建任务失败：", error);
      alert(error.message || "创建任务失败");
    }
  };

  const TaskDetailModal = ({ task, onClose }) => {
    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!task) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between border-b pb-3">
            <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
            <button
              onClick={onClose}
              className="text-xl font-bold text-gray-500 transition-colors hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {(task.dueDate || task.estimatedHours || task.actualHours) && (
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-500">
                时间信息
              </h4>
              <div className="flex flex-wrap gap-4">
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">截止时间:</span>
                    <span className="font-medium">
                      {new Date(task.dueDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {task.estimatedHours && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">预估工时:</span>
                    <span className="font-medium">
                      {task.estimatedHours} 小时
                    </span>
                  </div>
                )}
                {task.actualHours && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">实际工时:</span>
                    <span className="font-medium">
                      {task.actualHours} 小时
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {task.description && (
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-500">
                任务描述
              </h4>
              <p className="leading-relaxed text-gray-700">
                {task.description}
              </p>
            </div>
          )}

          {task.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-500">
                标签
              </h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.assignee && (
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-500">
                分配人员
              </h4>
              <div className="text-gray-700">
                {task.assignee.name}
                {task.assignee.email
                  ? `（${task.assignee.email}）`
                  : null}
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

  const TaskItem = ({ task, statusId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `task_${task.id}`,
      data: { taskId: task.id, task, statusId },
    });

  const [showAssigneeSelect, setShowAssigneeSelect] = useState(false);
  const [selectPos, setSelectPos] = useState({ x: 0, y: 0 });
  const [showTimeEdit, setShowTimeEdit] = useState(false);

  // 阻止按钮区域的拖拽事件
  const preventDrag = (event) => {
    event.stopPropagation();
  };

  // 处理分配人员点击
  const handleAssigneeClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowAssigneeSelect(true);
    setSelectPos({ x: event.clientX, y: event.clientY });
  };

  // 处理时间设置点击
  const handleTimeClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowTimeEdit(true);
  };

  // 处理分配人员选择
  const handleUserSelect = async (selectedUserId) => {
    const selectedUser =
      users.find((member) => String(member.id) === String(selectedUserId)) ||
      null;
    const previousAssignee = task.assignee;

    setStatuses((prev) =>
      prev.map((status) =>
        status.id === statusId
          ? {...status,
              tasks: status.tasks.map((item) =>
                item.id === task.id ? {...item, assignee: selectedUser } : item
              ),
            }
          : status
      )
    );

    setShowAssigneeSelect(false);

    try {
      const payload = await persistAssignee(
        Number(task.numericId ?? task.id),
        selectedUser ? selectedUser.id : null
      );
      const formatted = formatTask(payload);

      setStatuses((prev) =>
        prev.map((status) =>
          status.id === statusId
            ? {...status,
                tasks: status.tasks.map((item) =>
                  item.id === task.id
                    ? {...item,
                        assignee: formatted.assignee,
                        updatedAt: formatted.updatedAt,
                      }
                    : item
                ),
              }
            : status
        )
      );
    } catch (error) {
      console.error("更新任务失败：", error);
      alert(error.message || "更新任务失败");
      setStatuses((prev) =>
        prev.map((status) =>
          status.id === statusId
            ? {...status,
                tasks: status.tasks.map((item) =>
                  item.id === task.id
                    ? {...item, assignee: previousAssignee }
                    : item
                ),
              }
            : status
        )
      );
    }
  };

  // 处理时间保存
  const handleTimeSave = async (updatedTask) => {
    if (!user || !routeProjectId) {
      throw new Error("用户未登录或项目不存在");
    }

    const updateData = {
      userId: user.id,
    };

    if (updatedTask.dueDate !== undefined) {
      updateData.dueDate = updatedTask.dueDate;
    }
    if (updatedTask.estimatedHours !== undefined) {
      updateData.estimatedHours = updatedTask.estimatedHours;
    }
    if (updatedTask.actualHours !== undefined) {
      updateData.actualHours = updatedTask.actualHours;
    }

    try {
      const res = await fetch(
        `/api/projects/${routeProjectId}/board/tasks/${task.numericId ?? task.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const payload = await res.json();

      // 更新本地状态
      setStatuses((prev) =>
        prev.map((status) =>
          status.id === statusId
            ? {...status,
                tasks: status.tasks.map((item) =>
                  item.id === task.id
                    ? {...item,
                        dueDate: payload.dueDate,
                        estimatedHours: payload.estimatedHours,
                        actualHours: payload.actualHours,
                      }
                    : item
                ),
              }
            : status
        )
      );

      return payload;
    } catch (error) {
      console.error("更新时间失败:", error);
      throw new Error("更新时间失败: " + error.message);
    }
  };

  // 格式化时间显示
  const formatDueDate = (dueDate) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === date.toDateString();

    if (isToday) return '今天';
    if (isTomorrow) return '明天';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.4 : 1,
        }}
        className="mb-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing"
        onClick={() => setSelectedTask(task)}
        {...attributes}
        {...listeners} // 将拖拽功能应用到整个卡片
      >
        {/* 标题区域 */}
        <div className="mb-2">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
        </div>

        {/* 时间信息显示 */}
        {(task.dueDate || task.estimatedHours || task.actualHours) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.dueDate && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                📅 {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.estimatedHours && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                ⏱️ {task.estimatedHours}h
              </span>
            )}
            {task.actualHours && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                ✅ {task.actualHours}h
              </span>
            )}
          </div>
        )}

        {task.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-700">
            {task.description}
          </p>
        )}

        {task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 操作按钮区域 - 阻止拖拽事件 */}
        <div
          className="mt-3 flex flex-wrap gap-2"
          onPointerDown={preventDrag}
          onMouseDown={preventDrag}
          onTouchStart={preventDrag}
        >
          {/* 分配人员按钮 */}
          <button
            onClick={handleAssigneeClick}
            className="text-xs text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-2 py-1 transition-colors flex items-center gap-1"
          >
            👤 {task.assignee ? task.assignee.name : "分配人员"}
          </button>

          {/* 设置时间按钮 */}
          <button
            onClick={handleTimeClick}
            className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded px-2 py-1 transition-colors flex items-center gap-1"
          >
            ⚙️ 设置时间
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-600">{task.createdAt}</div>
      </div>

      {/* 时间编辑模态框 */}
      {showTimeEdit && (
        <TimeEditModal
          task={task}
          onSave={handleTimeSave}
          onClose={() => setShowTimeEdit(false)}
        />
      )}

      {/* 分配人员选择器 */}
      {showAssigneeSelect && (
        <div
          style={{
            position: "fixed",
            left: selectPos.x,
            top: selectPos.y,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            padding: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            minWidth: "140px",
            zIndex: 1000,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            onClick={() => handleUserSelect("")}
            className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            未分配
          </div>
          {users.map((member) => (
            <div
              key={member.id}
              onClick={() => handleUserSelect(member.id)}
              className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {member.name || member.email}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

  const StatusColumn = ({ status }) => {
    const { setNodeRef, attributes } = useDroppable({
      id: status.id,
      data: { statusId: status.id },
    });

    return (
      <div className="mr-6 w-80 flex-shrink-0">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{status.name}</h3>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
            {status.tasks.length}
          </span>
        </div>
        <div
          ref={setNodeRef}
          {...attributes}
          className="min-h-[500px] rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-gray-300"
        >
          <SortableContext
            items={status.tasks.map((task) => `task_${task.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {status.tasks.map((task) => (
              <TaskItem key={task.id} task={task} statusId={status.id} />
            ))}
          </SortableContext>
        </div>
      </div>
    );
  };

  // 处理右键菜单选择
  const handleContextMenuSelect = async (action) => {
    const { task, statusId } = contextMenu;

    if (action === 'assign') {
      // 原有的分配人员逻辑
      setContextMenu(prev => ({ ...prev, show: false }));
      // 这里可以打开分配人员的选择器
    } else if (action === 'time') {
      // 打开时间编辑模态框
      setContextMenu(prev => ({ ...prev, show: false }));
      setSelectedTask({ ...task, __timeEdit: true });
    }

    setContextMenu(prev => ({ ...prev, show: false }));
  };

  if (loadingProjects) {
    return <div className="p-8 text-gray-700 font-medium">加载项目中...</div>;
  }

  if (!currentProject) {
    return (
      <div className="p-8 text-gray-700">
        项目不存在或未加载，请返回仪表盘重新选择。
        <Link
          href="/dashboard"
          className="ml-2 text-blue-600 underline underline-offset-4 hover:text-blue-700"
        >
          返回仪表盘
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="w-58 overflow-y-auto border-r border-gray-200 bg-white p-4">
        <div className="mb-6">
          <Link href="/dashboard">
            <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
              ← 返回仪表盘
            </button>
          </Link>
        </div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">我的项目</h2>
        <ul className="space-y-1">
          {allProjects.map((proj) => (
            <li key={proj.id}>
              <Link
                href={`/projects/${proj.id}`}
                className={`block w-full rounded-md px-3 py-2 text-sm transition-colors ${
                  proj.id === routeProjectId?.toString()
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {proj.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="ml-4 flex-1 overflow-x-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          {currentProject.name} - 项目看板
        </h1>

        {boardError && (
          <div className="mb-6 rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {boardError}
          </div>
        )}

        <div className="mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="添加新状态列（如：待测试）"
              value={newStatusName}
              onChange={(event) => setNewStatusName(event.target.value)}
              className="w-64 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createStatus}
              className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              添加状态列
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
              <div>
                <label className="mb-1 block text-sm text-gray-700 font-medium">
                  任务标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="输入标题..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  描述（可选）
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="任务详情..."
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  标签（可选，逗号分隔）
                </label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      tags: event.target.value,
                    }))
                  }
                  placeholder="如：bug,前端,紧急"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  分配人员
                </label>
                <select
                  value={newTask.assignee?.id || ""}
                  onChange={(event) => {
                    const selectedUser = users.find(
                      (member) => String(member.id) === event.target.value
                    );
                    setNewTask((prev) => ({...prev,
                      assignee: selectedUser || null,
                    }));
                  }}
                  disabled={usersLoading}
                  className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    newTask.assignee?.id ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  <option value="" className="text-gray-500">未分配</option>
                  {usersLoading ? (
                    <option value="" className="text-gray-500">加载中...</option>
                  ) : (
                    users.map((member) => (
                      <option key={member.id} value={member.id} className="text-gray-900">
                        {member.name || member.email}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  截止时间
                </label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate || ''}
                  onChange={(event) =>
                    setNewTask((prev) => ({...prev,
                      dueDate: event.target.value,
                    }))
                  }
                  className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    newTask.dueDate ? 'text-gray-900' : 'text-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  预估工时 (小时)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newTask.estimatedHours || ''}
                  onChange={(event) =>
                    setNewTask((prev) => ({...prev,
                      estimatedHours: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  placeholder="如：8"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={createTask}
                  disabled={
                    !newTask.statusId || statuses.length === 0 || loadingBoard
                  }
                  className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  创建任务
                </button>
              </div>
            </div>
          </div>
        </div>

        {loadingBoard ? (
          <div className="p-6 text-gray-500">看板数据加载中...</div>
        ) : statuses.length === 0 ? (
          <div className="p-6 text-gray-500">
            暂无状态列，请先添加状态列以创建任务。
          </div>
        ) : (
          <DndContext
            onDragStart={(event) => {
              const task = event.active.data.current?.task;
              const statusId = event.active.data.current?.statusId || "";
              if (task) {
                setActiveTask({ ...task });
                setActiveStatusId(statusId);
              }
            }}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
              setActiveTask(null);
              setActiveStatusId("");
            }}
          >
            <div className="flex gap-2 overflow-x-auto pb-8">
              <SortableContext
                items={statuses.map((status) => status.id)}
                strategy={horizontalListSortingStrategy}
              >
                {statuses.map((status) => (
                  <StatusColumn key={status.id} status={status} />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="z-50 w-72 shadow-xl">
                  <TaskItem task={activeTask} statusId={activeStatusId} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* 任务详情模态框 */}
      <TaskDetailModal task={selectedTask && !selectedTask.__timeEdit ? selectedTask : null} onClose={() => setSelectedTask(null)} />

      {/* 时间编辑模态框 */}
      {selectedTask && selectedTask.__timeEdit && (
        <TimeEditModal
          task={selectedTask}
          onSave={handleTimeSave}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* 右键菜单 */}
      {contextMenu.show && (
        <div
          style={{
            position: "fixed",
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            padding: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            minWidth: "140px",
            zIndex: 1000,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            onClick={() => handleContextMenuSelect('time')}
            className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            ⚙️ 设置时间
          </div>
          <div
            onClick={() => handleContextMenuSelect('assign')}
            className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            👤 分配人员
          </div>
        </div>
      )}
    </div>
  );
}