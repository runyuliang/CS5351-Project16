'use client';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';

// 燃尽图组件
const BurndownChart = ({ sprint, tasks }) => {
  // 计算燃尽图数据
  const chartData = useMemo(() => {
    if (!sprint || !tasks || tasks.length === 0) {
      return { idealLine: [], actualLine: [], dates: [] };
    }

    // 确定时间范围
    const startDate = sprint.startDate ? new Date(sprint.startDate) : new Date(sprint.createdAt);
    const endDate = sprint.endDate || sprint.dueDate ? new Date(sprint.endDate || sprint.dueDate) : new Date();
    
    // 如果结束日期早于开始日期，使用当前日期
    if (endDate < startDate) {
      endDate.setTime(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 默认14天
    }

    // 计算总工作量（使用预估工时，如果没有则使用任务数量）
    const totalWork = tasks.reduce((sum, task) => {
      return sum + (task.estimatedHours || 1);
    }, 0);

    // 生成日期数组（每天一个点）
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 理想燃尽线（线性递减）
    const idealLine = dates.map((date, index) => {
      const progress = index / (dates.length - 1 || 1);
      return {
        date,
        value: totalWork * (1 - progress),
      };
    });

    // 实际燃尽线（根据任务完成情况，使用actualHours）
    const actualLine = dates.map((date) => {
      // 计算该日期之前完成的工作量（使用actualHours）
      const completedWork = tasks.reduce((sum, task) => {
        // 如果任务已完成，且更新时间在该日期之前
        // 支持多种完成状态的表示方式
        const isCompleted = task.status === '完成' || 
                          task.status === 'Done' || 
                          task.status === '已完成';
        if (isCompleted) {
          const taskUpdateTime = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt);
          if (taskUpdateTime <= date) {
            // 使用actualHours，如果没有则使用estimatedHours作为fallback
            return sum + (task.actualHours || task.estimatedHours || 1);
          }
        }
        return sum;
      }, 0);

      return {
        date,
        value: totalWork - completedWork,
      };
    });

    return { idealLine, actualLine, dates, totalWork };
  }, [sprint, tasks]);

  const { idealLine, actualLine, dates, totalWork } = chartData;

  if (dates.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cannot generate burndown chart: Missing time information
      </div>
    );
  }

  // 图表尺寸
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 计算Y轴最大值
  const maxValue = Math.max(totalWork, ...actualLine.map(p => p.value)) * 1.1;

  // 坐标转换函数
  const xScale = (date) => {
    const start = dates[0].getTime();
    const end = dates[dates.length - 1].getTime();
    const range = end - start;
    return ((date.getTime() - start) / range) * chartWidth;
  };

  const yScale = (value) => {
    return chartHeight - (value / maxValue) * chartHeight;
  };

  // 生成路径
  const idealPath = idealLine
    .map((point, index) => {
      const x = xScale(point.date) + padding.left;
      const y = yScale(point.value) + padding.top;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const actualPath = actualLine
    .map((point, index) => {
      const x = xScale(point.date) + padding.left;
      const y = yScale(point.value) + padding.top;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Y轴刻度
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return (maxValue / (yTicks - 1)) * (yTicks - 1 - i);
  });

  // X轴刻度（显示部分日期）
  const xTicks = Math.min(7, dates.length);
  const xTickIndices = Array.from({ length: xTicks }, (_, i) => {
    return Math.floor((i / (xTicks - 1)) * (dates.length - 1));
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{sprint.name}</h3>
        <p className="text-sm text-gray-500">
          {dates[0] && dates[0].toLocaleDateString()} - {dates[dates.length - 1] && dates[dates.length - 1].toLocaleDateString()}
        </p>
        <div className="mt-2 flex gap-4 text-sm">
          <span className="text-gray-600">Total Work: <strong>{totalWork.toFixed(1)}</strong> hours</span>
          <span className="text-gray-600">Tasks: <strong>{tasks.length}</strong></span>
          <span className="text-gray-600">Status: <strong>{sprint.status}</strong></span>
        </div>
      </div>

      <svg width={width} height={height} className="border border-gray-200 rounded">
        {/* 网格线 */}
        {yTickValues.map((value, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(value) + padding.top}
              x2={width - padding.right}
              y2={yScale(value) + padding.top}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Y轴 */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* X轴 */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Y轴标签 */}
        {yTickValues.map((value, i) => (
          <text
            key={i}
            x={padding.left - 10}
            y={yScale(value) + padding.top + 4}
            textAnchor="end"
            fontSize="12"
            fill="#6b7280"
          >
            {value.toFixed(0)}
          </text>
        ))}

        {/* X轴标签 */}
        {xTickIndices.map((index) => {
          const date = dates[index];
          if (!date) return null;
          return (
            <text
              key={index}
              x={xScale(date) + padding.left}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          );
        })}

        {/* 理想燃尽线 */}
        <path
          d={idealPath}
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* 实际燃尽线 */}
        <path
          d={actualPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {actualLine.map((point, index) => {
          if (index % Math.ceil(actualLine.length / 10) !== 0) return null;
          const x = xScale(point.date) + padding.left;
          const y = yScale(point.value) + padding.top;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#3b82f6"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-400 border-dashed border-t-2 border-blue-400"></div>
          <span className="text-sm text-gray-600">Ideal Burndown</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-600"></div>
          <span className="text-sm text-gray-600">Actual Burndown</span>
        </div>
      </div>
    </div>
  );
};

export default function BurndownPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
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
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setAllProjects([]);
    }
  }, []);

  // 获取Sprint数据
  const fetchSprints = useCallback(async (projectId, userId) => {
    if (!projectId || !userId) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectId}/sprint?userId=${userId}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch sprint data');
      }

      const payload = await res.json();
      setSprints(payload.sprints || []);
    } catch (error) {
      console.error('Failed to fetch sprint data:', error);
      setError(error.message || 'Failed to fetch sprint data');
      setSprints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects(user);
      if (projectId && user.id) {
        fetchSprints(Number(projectId), user.id);
      }
    }
  }, [user, projectId, fetchProjects, fetchSprints]);

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
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Burndown Chart</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : sprints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No sprint data available. Please create a sprint first.
            </div>
          ) : (
            <div className="space-y-6">
              {sprints.map((sprint) => (
                <BurndownChart
                  key={sprint.id}
                  sprint={sprint}
                  tasks={sprint.tasks || []}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
