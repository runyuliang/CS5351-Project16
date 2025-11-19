'use client';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';

export default function SummaryPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } catch (error) {
      console.error('Failed to parse user info:', error);
      router.push('/login');
    }
  }, [router]);

  // 获取项目列表
  const fetchProjects = useCallback(async (userData) => {
    try {
      const res = await fetch('/api/user/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }

      const payload = await res.json();
      const projects = (payload.projects || []).map((proj) => ({
        ...proj,
        id: proj.id.toString(),
      }));

      setAllProjects(projects);
      
      // 设置当前项目
      const current = projects.find(p => p.id === projectId?.toString());
      setCurrentProject(current || null);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setAllProjects([]);
      setCurrentProject(null);
    }
  }, [projectId]);

  // 获取项目数据
  const fetchProjectData = useCallback(async (projectId, userId) => {
    if (!projectId || !userId) return;

    setLoading(true);
    setError('');

    try {
      // 并行获取所有数据
      const [sprintsRes, boardRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/sprint?userId=${userId}`),
        fetch(`/api/projects/${projectId}/board?userId=${userId}`),
      ]);

      if (!sprintsRes.ok) {
        throw new Error('Failed to fetch sprint data');
      }
      if (!boardRes.ok) {
        throw new Error('Failed to fetch board data');
      }

      const sprintsData = await sprintsRes.json();
      const boardData = await boardRes.json();

      setSprints(sprintsData.sprints || []);
      
      // 从columns中提取所有任务
      const boardTasks = (boardData.columns || []).flatMap(column => 
        (column.tasks || []).map(task => ({
          ...task,
          columnName: column.name,
          source: 'board',
        }))
      );
      
      // 从sprints中提取所有任务（避免重复）
      const sprintTasks = (sprintsData.sprints || []).flatMap(sprint =>
        (sprint.tasks || []).map(task => ({
          ...task,
          sprintName: sprint.name,
          source: 'sprint',
        }))
      );
      
      // 合并任务，去重（基于task.id）
      const taskMap = new Map();
      [...boardTasks, ...sprintTasks].forEach(task => {
        if (!taskMap.has(task.id)) {
          taskMap.set(task.id, task);
        } else {
          // 合并信息
          const existing = taskMap.get(task.id);
          taskMap.set(task.id, {
            ...existing,
            ...task,
            columnName: existing.columnName || task.columnName,
            sprintName: existing.sprintName || task.sprintName,
          });
        }
      });
      
      setTasks(Array.from(taskMap.values()));
      setColumns(boardData.columns || []);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setError(error.message || 'Failed to fetch project data');
      setSprints([]);
      setTasks([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects(user);
      if (projectId && user.id) {
        fetchProjectData(Number(projectId), user.id);
      }
    }
  }, [user, projectId, fetchProjects, fetchProjectData]);

  // 计算统计数据
  const statistics = useMemo(() => {
    // Sprint统计
    const totalSprints = sprints.length;
    const activeSprints = sprints.filter(s => 
      s.status === '正在冲刺' || s.status === '进行中'
    ).length;
    const completedSprints = sprints.filter(s => 
      s.status === '完成' || s.status === '已完成'
    ).length;
    const notStartedSprints = sprints.filter(s => 
      s.status === '未开始'
    ).length;

    // 任务统计
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => 
      t.status === '完成' || t.status === 'Done' || t.status === '已完成'
    ).length;
    const inProgressTasks = tasks.filter(t => 
      t.status === '进行中' || t.status === 'In Progress'
    ).length;
    const inReviewTasks = tasks.filter(t => 
      t.status === '审核中' || t.status === 'In Review'
    ).length;
    const notStartedTasks = tasks.filter(t => 
      t.status === '未开始' || t.status === 'To do'
    ).length;

    // 工时统计
    const totalEstimatedHours = tasks.reduce((sum, task) => 
      sum + (task.estimatedHours || 0), 0
    );
    const totalActualHours = tasks.reduce((sum, task) => 
      sum + (task.actualHours || 0), 0
    );
    const completedEstimatedHours = tasks
      .filter(t => t.status === '完成' || t.status === 'Done' || t.status === '已完成')
      .reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const completedActualHours = tasks
      .filter(t => t.status === '完成' || t.status === 'Done' || t.status === '已完成')
      .reduce((sum, task) => sum + (task.actualHours || 0), 0);

    // 任务分配统计
    const assignedTasks = tasks.filter(t => t.assignee).length;
    const unassignedTasks = totalTasks - assignedTasks;

    // 按列统计任务
    const tasksByColumn = columns.map(column => ({
      name: column.name,
      count: tasks.filter(t => t.columnName === column.name).length,
    }));

    // 按Sprint统计任务
    const tasksBySprint = sprints.map(sprint => ({
      name: sprint.name,
      count: (sprint.tasks || []).length,
      estimatedHours: (sprint.tasks || []).reduce((sum, t) => 
        sum + (t.estimatedHours || 0), 0
      ),
    }));

    // 过期任务
    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && 
      (t.status !== '完成' && t.status !== 'Done' && t.status !== '已完成')
    ).length;

    // 过期Sprint
    const overdueSprints = sprints.filter(s => 
      s.dueDate && new Date(s.dueDate) < now && 
      (s.status !== '完成' && s.status !== '已完成')
    ).length;

    return {
      sprints: {
        total: totalSprints,
        active: activeSprints,
        completed: completedSprints,
        notStarted: notStartedSprints,
        overdue: overdueSprints,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        inReview: inReviewTasks,
        notStarted: notStartedTasks,
        assigned: assignedTasks,
        unassigned: unassignedTasks,
        overdue: overdueTasks,
      },
      hours: {
        totalEstimated: totalEstimatedHours,
        totalActual: totalActualHours,
        completedEstimated: completedEstimatedHours,
        completedActual: completedActualHours,
        efficiency: completedEstimatedHours > 0 
          ? ((completedActualHours / completedEstimatedHours) * 100).toFixed(1)
          : 0,
      },
      tasksByColumn,
      tasksBySprint,
    };
  }, [sprints, tasks, columns]);

  if (loading && !user) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ProjectSidebar 
        allProjects={allProjects} 
        currentProjectId={projectId} 
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {currentProject?.name || 'Project'} - Summary
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-6">
              {/* Sprint Statistics Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Sprint Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {statistics.sprints.total}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Sprints</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">
                      {statistics.sprints.active}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Active</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {statistics.sprints.completed}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Completed</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-gray-600">
                      {statistics.sprints.notStarted}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Not Started</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-red-600">
                      {statistics.sprints.overdue}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Overdue</div>
                  </div>
                </div>
              </div>

              {/* Task Statistics Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Task Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {statistics.tasks.total}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">
                      {statistics.tasks.completed}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Completed</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {statistics.tasks.total > 0 
                        ? `${((statistics.tasks.completed / statistics.tasks.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-yellow-600">
                      {statistics.tasks.inProgress}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">In Progress</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-orange-600">
                      {statistics.tasks.inReview}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">In Review</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-600">
                      {statistics.tasks.notStarted}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Not Started</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-indigo-600">
                      {statistics.tasks.assigned}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Assigned</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {statistics.tasks.overdue}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Overdue</div>
                  </div>
                </div>
              </div>

              {/* Hours Statistics Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Hours Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.hours.totalEstimated.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Estimated</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {statistics.hours.totalActual.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Actual</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {statistics.hours.completedEstimated.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Completed Estimated</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-indigo-600">
                      {statistics.hours.completedActual.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Completed Actual</div>
                    {statistics.hours.completedEstimated > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Efficiency: {statistics.hours.efficiency}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tasks by Column */}
              {statistics.tasksByColumn.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Tasks by Column</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statistics.tasksByColumn.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-700">
                          {item.count}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{item.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks by Sprint */}
              {statistics.tasksBySprint.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Tasks by Sprint</h2>
                  <div className="space-y-3">
                    {statistics.tasksBySprint.map((sprint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{sprint.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {sprint.count} tasks
                            {sprint.estimatedHours > 0 && (
                              <span className="ml-2">
                                · {sprint.estimatedHours.toFixed(1)} hours
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
