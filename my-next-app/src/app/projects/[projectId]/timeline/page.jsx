'use client';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';
import Link from 'next/link';

// 任务详情模态框组件
const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">任务详情</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <p className="text-lg font-semibold text-gray-900">{task.title}</p>
            </div>

            {task.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {task.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
                  <p className="text-gray-700">
                    {new Date(task.dueDate).toLocaleString()}
                  </p>
                </div>
              )}
              {task.estimatedHours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预估工时</label>
                  <p className="text-gray-700">{task.estimatedHours} 小时</p>
                </div>
              )}
              {task.actualHours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">实际工时</label>
                  <p className="text-gray-700">{task.actualHours} 小时</p>
                </div>
              )}
            </div>

            {task.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map(tag => (
                    <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <p className="text-gray-700">{task.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                <p className="text-gray-700">{task.assignee?.name || '未分配'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 日历视图组件
// 日历视图组件 - 修复版本
const CalendarView = ({ tasks, currentDate, onDateClick, onMonthChange, onTodayClick }) => {
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    let currentWeek = [];
    let loopDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      currentWeek.push(new Date(loopDate));
      loopDate.setDate(loopDate.getDate() + 1);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return { year, month, weeks };
  }, [currentDate]);

  const { year, month, weeks } = calendarData;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
  <div className="flex items-center gap-4">
    <button
      onClick={() => onMonthChange('prev')}
      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
    >
      上个月
    </button>
    <h3 className="text-lg font-semibold text-gray-800">
      {year}年{month + 1}月
    </h3>
    <button
      onClick={() => onMonthChange('next')}
      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
    >
      下个月
    </button>
  </div>
  <button
    onClick={onTodayClick}
    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
  >
    今天
  </button>
</div>
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="divide-y divide-gray-200">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((date, dayIndex) => {
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === new Date().toDateString();
              const dayTasks = tasks.filter(task =>
                task.dueDate && new Date(task.dueDate).toDateString() === date.toDateString()
              );

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[120px] p-2 border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  } ${isToday ? 'bg-blue-50 border-2 border-blue-300' : ''} ${
                    dayTasks.length > 0 ? 'hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onDateClick(date, dayTasks)}
                >
                  <div className={`text-sm mb-1 ${
                    isToday 
                      ? 'font-bold text-blue-700 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                      : isCurrentMonth 
                        ? 'text-gray-800 font-medium' 
                        : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-600 font-medium">
                        +{dayTasks.length - 3} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// 时间线视图组件 - 修复版本
// 时间线视图组件 - 修复版本
const TimelineView = ({ tasks, onTaskClick }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { startDate, endDate, days } = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (timeRange) {
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'quarter':
        const quarter = Math.floor(currentDate.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        end.setMonth((quarter + 1) * 3, 0);
        break;
      default:
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 7);
    }

    const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const daysArray = Array.from({ length: daysCount }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });

    return { startDate: start, endDate: end, days: daysArray };
  }, [currentDate, timeRange]);

  const navigateTime = (direction) => {
    const newDate = new Date(currentDate);
    switch (timeRange) {
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
    }
    setCurrentDate(newDate);
  };

  const getTaskPosition = (task) => {
    if (!task.dueDate) return null;

    const taskDate = new Date(task.dueDate);
    const daysFromStart = Math.floor((taskDate - startDate) / (1000 * 60 * 60 * 24));
    const totalDays = days.length;

    if (daysFromStart < 0 || daysFromStart >= totalDays) return null;

    return {
      left: `${(daysFromStart / totalDays) * 100}%`,
      width: '100px'
    };
  };

  const tasksByStatus = useMemo(() => {
    const grouped = {};
    tasks.forEach(task => {
      const status = task.status || '未分类';
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
    });
    return grouped;
  }, [tasks]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 gap-4">
  <div className="flex flex-wrap items-center gap-2">
    <button
      onClick={() => navigateTime('prev')}
      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
    >
      上一{timeRange === 'week' ? '周' : timeRange === 'month' ? '月' : '季度'}
    </button>
    <h3 className="text-base font-semibold whitespace-nowrap text-gray-800">
      {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
    </h3>
    <button
      onClick={() => navigateTime('next')}
      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
    >
      下一{timeRange === 'week' ? '周' : timeRange === 'month' ? '月' : '季度'}
    </button>
  </div>

  <div className="flex gap-2">
    <select
      value={timeRange}
      onChange={(e) => setTimeRange(e.target.value)}
      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-800"
    >
      <option value="week">周视图</option>
      <option value="month">月视图</option>
      <option value="quarter">季度视图</option>
    </select>
    <button
      onClick={() => setCurrentDate(new Date())}
      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm whitespace-nowrap text-gray-800"
    >
      今天
    </button>
  </div>
</div>
      {/* 修复：添加正确的滚动容器和宽度限制 */}
      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ width: 'max-content' }}>
          {/* 表头 */}
          <div className="flex border-b border-gray-200">
            <div className="w-40 flex-shrink-0 p-3 font-semibold border-r border-gray-200 bg-gray-50 text-gray-800">
              任务
            </div>
            <div className="flex">
              {days.map((date, index) => (
                <div
                  key={index}
                  className={`w-12 flex-shrink-0 p-2 text-center text-xs border-r border-gray-200 ${
                    date.toDateString() === new Date().toDateString() 
                      ? 'bg-blue-100 text-blue-800 font-bold' 
                      : 'text-gray-700'
                  }`}
                >
                  <div className="font-semibold">{date.getDate()}</div>
                  <div className={`text-xs ${
                    date.toDateString() === new Date().toDateString() 
                      ? 'text-blue-600' 
                      : 'text-gray-500'
                  }`}>
                    {date.getMonth() + 1}/{date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 任务行 */}
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status}>
              <div className="flex border-b border-gray-100 bg-gray-50">
                <div className="w-40 flex-shrink-0 p-3 font-semibold border-r border-gray-200 text-gray-800">
                  {status}
                </div>
                <div className="flex-1"></div>
              </div>

              {statusTasks.map(task => {
                const position = getTaskPosition(task);

                return (
                  <div
                    key={task.id}
                    className="flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="w-40 flex-shrink-0 p-3 border-r border-gray-200">
                      <div className="font-semibold text-sm truncate text-gray-800" title={task.title}>
                        {task.title}
                      </div>
                      {task.assignee && (
                        <div className="text-xs text-gray-600 mt-1 truncate">
                          负责人: {task.assignee.name}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="text-xs text-gray-600 truncate">
                          截止: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="relative min-h-[60px]" style={{ width: `${days.length * 48}px` }}>
                      {position && (
                        <div
                          className="absolute top-2 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs px-2 cursor-pointer hover:bg-blue-600 transition-colors"
                          style={{
                            left: position.left,
                            width: position.width,
                            maxWidth: position.width
                          }}
                          title={`${task.title} - ${new Date(task.dueDate).toLocaleDateString()}`}
                        >
                          <span className="truncate font-medium">{task.title}</span>
                        </div>
                      )}

                      {/* 今日线 */}
                      {new Date() >= startDate && new Date() <= endDate && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                          style={{
                            left: `${((new Date() - startDate) / (endDate - startDate)) * 100}%`
                          }}
                        >
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* 未设置时间的任务 */}
          {tasks.filter(task => !task.dueDate).length > 0 && (
            <div>
              <div className="flex border-b border-gray-100 bg-gray-50">
                <div className="w-40 flex-shrink-0 p-3 font-semibold border-r border-gray-200 text-gray-800">
                  未设置时间
                </div>                <div className="flex-1"></div>
              </div>
              {tasks.filter(task => !task.dueDate).map(task => (
                <div
                  key={task.id}
                  className="flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="w-40 flex-shrink-0 p-3 border-r border-gray-200">
                    <div className="font-semibold text-sm truncate text-gray-800">{task.title}</div>
                    {task.assignee && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        负责人: {task.assignee.name}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">未设置截止时间</div>
                  </div>
                  <div className="flex-1 p-3 text-gray-600 text-sm">
                    请在任务详情中设置截止时间以在时间线中显示
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 列表视图组件
// 列表视图组件
const ListView = ({ tasks, onTaskClick }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">任务时间线</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                )}
                {task.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {task.tags.map(tag => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right text-sm">
                {task.dueDate ? (
                  <div className={`px-2 py-1 rounded ${
                    new Date(task.dueDate) < new Date() 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    截止: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-gray-500">未设置时间</div>
                )}
                {task.estimatedHours && (
                  <div className="text-gray-600 mt-1">预估: {task.estimatedHours}h</div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>状态: {task.status}</span>
              <span>负责人: {task.assignee?.name || '未分配'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 日期任务列表组件
const DayTasksList = ({ date, tasks, onClose, onTaskClick }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          {new Date(date).toLocaleDateString()} 的任务 ({tasks.length}个)
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{task.title}</span>
              <span className="text-sm text-gray-500">{task.status}</span>
            </div>
            {task.assignee && (
              <div className="text-sm text-gray-600 mt-1">
                负责人: {task.assignee.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 主时间线视图组件
const EnhancedTimelineView = ({ tasks }) => {
  const [currentView, setCurrentView] = useState('timeline');
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleDateClick = (date, dayTasks) => {
    if (dayTasks.length > 0) {
      setSelectedDate(date);
      setSelectedDayTasks(dayTasks);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleCloseDayTasks = () => {
    setSelectedDayTasks([]);
    setSelectedDate(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">暂无任务数据</p>
        <p className="text-sm text-gray-400 mt-2">请在看板页面创建任务并设置截止时间</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('list')}
            className={`px-4 py-2 rounded text-sm ${
              currentView === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            列表视图
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`px-4 py-2 rounded text-sm ${
              currentView === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            日历视图
          </button>
          <button
            onClick={() => setCurrentView('timeline')}
            className={`px-4 py-2 rounded text-sm ${
              currentView === 'timeline' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            时间线视图
          </button>
        </div>

        <div className="text-sm text-gray-600">
          显示 {tasks.filter(t => t.dueDate).length}/{tasks.length} 个有时间设置的任务
        </div>
      </div>

      {selectedDayTasks.length > 0 && (
        <DayTasksList
          date={selectedDate}
          tasks={selectedDayTasks}
          onClose={handleCloseDayTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {currentView === 'list' && (
        <ListView tasks={tasks} onTaskClick={handleTaskClick} />
      )}

      {currentView === 'calendar' && (
        <CalendarView
          tasks={tasks}
          currentDate={currentDate}
          onDateClick={handleDateClick}
          onMonthChange={navigateMonth}
          onTodayClick={handleTodayClick}
        />
      )}

      {currentView === 'timeline' && (
        <TimelineView
          tasks={tasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

// 主页面组件
export default function TimelinePage() {
  const { projectId } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserProjects = useCallback(async (userData, targetProjectId) => {
    try {
      const res = await fetch("/api/user/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const payload = await res.json();
      const projects = (payload.projects || []).map((proj) => ({...proj,
        id: proj.id.toString(),
      }));

      setAllProjects(projects);

      const normalizedTarget = targetProjectId != null ? targetProjectId.toString() : null;
      const current = projects.find((proj) => proj.id === normalizedTarget) || null;
      setCurrentProject(current);

    } catch (error) {
      console.error("获取项目失败：", error);
      setAllProjects([]);
      setCurrentProject(null);
    }
  }, []);

  const fetchTimelineData = useCallback(async (projectId, userId) => {
    if (!projectId || !userId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/timeline?userId=${userId}`);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const payload = await res.json();
      setTasks(payload.tasks || []);

    } catch (error) {
      console.error("加载时间线数据失败：", error);
      setError(error.message || "加载时间线数据失败");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (!user || !projectId) return;

    fetchUserProjects(user, projectId).then(() => {
      fetchTimelineData(Number(projectId), user.id);
    });
  }, [user, projectId, fetchUserProjects, fetchTimelineData]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <ProjectSidebar
          allProjects={allProjects}
          currentProjectId={projectId}
        />
        <div className="flex-1 p-6">
          <div className="text-gray-500">加载时间线数据中...</div>
          <div className="text-sm text-gray-400 mt-2">正在获取项目任务数据</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <ProjectSidebar
          allProjects={allProjects}
          currentProjectId={projectId}
        />
        <div className="flex-1 p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">加载失败</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => fetchTimelineData(Number(projectId), user?.id)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                重试
              </button>
              <Link
                href={`/projects/${projectId}`}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                返回看板
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ProjectSidebar
        allProjects={allProjects}
        currentProjectId={projectId}
      />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="mb-6">
          <Link href={`/projects/${projectId}`}>
            <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
              ← 返回看板
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-300 mb-2">
            {currentProject?.name || '项目'} - 时间线
          </h1>
          <p className="text-gray-300">
            查看任务的时间分布和截止日期
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">总任务数</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(task => task.dueDate).length}
            </div>
            <div className="text-sm text-gray-600">已设置截止时间</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date()).length}
            </div>
            <div className="text-sm text-gray-600">已过期任务</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">总预估工时</div>
          </div>
        </div>

        <div className="overflow-hidden">
          <EnhancedTimelineView tasks={tasks} />
        </div>
      </div>
    </div>
  );
}