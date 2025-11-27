'use client';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';
import Link from 'next/link';

// 任务详情模态框组件 - Task Detail Modal Component
const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-lg font-semibold text-gray-900">{task.title}</p>
            </div>

            {task.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {task.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <p className="text-gray-700">
                    {new Date(task.dueDate).toLocaleString()}
                  </p>
                </div>
              )}
              {task.estimatedHours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <p className="text-gray-700">{task.estimatedHours} hours</p>
                </div>
              )}
              {task.actualHours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
                  <p className="text-gray-700">{task.actualHours} hours</p>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className="text-gray-700">{task.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <p className="text-gray-700">{task.assignee?.name || 'Unassigned'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sprint详情模态框组件 - Sprint Detail Modal Component
const SprintDetailModal = ({ sprint, onClose }) => {
  if (!sprint) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Sprint Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name</label>
              <p className="text-lg font-semibold text-gray-900">{sprint.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {sprint.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <p className="text-gray-700">
                    {new Date(sprint.dueDate).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <p className="text-gray-700">#{sprint.order}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className="text-gray-700">{sprint.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-gray-700">
                  {new Date(sprint.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {sprint.tasks && sprint.tasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Included Tasks ({sprint.tasks.length})</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sprint.tasks.map(task => (
                    <div key={task.id} className="bg-gray-50 p-3 rounded border">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-600">Status: {task.status}</p>
                        {task.assignee && (
                          <p className="text-sm text-gray-600">Assignee: {task.assignee.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 日历视图组件 - Calendar View Component
const CalendarView = ({ tasks, sprints, currentDate, onDateClick, onMonthChange, onTodayClick, onSprintClick }) => {
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onMonthChange('prev')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
          >
            Previous Month
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {year} {new Date(year, month).toLocaleString('default', { month: 'long' })}
          </h3>
          <button
            onClick={() => onMonthChange('next')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
          >
            Next Month
          </button>
        </div>
        <button
          onClick={onTodayClick}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
        >
          Today
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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
              const daySprints = sprints.filter(sprint =>
                sprint.dueDate && new Date(sprint.dueDate).toDateString() === date.toDateString()
              );

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[120px] p-2 border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  } ${isToday ? 'bg-blue-50 border-2 border-blue-300' : ''} ${
                    (dayTasks.length > 0 || daySprints.length > 0) ? 'hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onDateClick(date, [...dayTasks, ...daySprints])}
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
                    {daySprints.slice(0, 2).map(sprint => (
                      <div
                        key={sprint.id}
                        className="text-xs p-1 bg-green-100 text-green-800 rounded truncate font-semibold"
                        title={`Sprint: ${sprint.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSprintClick(sprint);
                        }}
                      >
                        🚀 {sprint.name}
                      </div>
                    ))}
                    {dayTasks.slice(0, 3 - daySprints.length).map(task => (
                      <div
                        key={task.id}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {(dayTasks.length + daySprints.length) > 3 && (
                      <div className="text-xs text-gray-600 font-medium">
                        +{(dayTasks.length + daySprints.length) - 3} more
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

// 时间线视图组件 - Timeline View Component
const TimelineView = ({ tasks, sprints, onTaskClick, onSprintClick }) => {
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

  const getItemPosition = (item) => {
    if (!item.dueDate) return null;

    const itemDate = new Date(item.dueDate);
    const daysFromStart = Math.floor((itemDate - startDate) / (1000 * 60 * 60 * 24));
    const totalDays = days.length;

    if (daysFromStart < 0 || daysFromStart >= totalDays) return null;

    return {
      left: `${(daysFromStart / totalDays) * 100}%`,
      width: item.type === 'sprint' ? '150px' : '100px'
    };
  };

  // 合并任务和Sprint数据 - Merge tasks and sprints data
  const allItems = useMemo(() => {
    const taskItems = tasks.map(task => ({ ...task, type: 'task' }));
    const sprintItems = sprints.map(sprint => ({ ...sprint, type: 'sprint' }));
    return [...taskItems, ...sprintItems];
  }, [tasks, sprints]);

  const itemsByStatus = useMemo(() => {
    const grouped = {};
    allItems.forEach(item => {
      const status = item.status || 'Uncategorized';
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(item);
    });
    return grouped;
  }, [allItems]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigateTime('prev')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
          >
            Previous {timeRange === 'week' ? 'Week' : timeRange === 'month' ? 'Month' : 'Quarter'}
          </button>
          <h3 className="text-base font-semibold whitespace-nowrap text-gray-800">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </h3>
          <button
            onClick={() => navigateTime('next')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-800"
          >
            Next {timeRange === 'week' ? 'Week' : timeRange === 'month' ? 'Month' : 'Quarter'}
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-800"
          >
            <option value="week">Week View</option>
            <option value="month">Month View</option>
            <option value="quarter">Quarter View</option>
          </select>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm whitespace-nowrap text-gray-800"
          >
            Today
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ width: 'max-content' }}>
          {/* 表头 - Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-40 flex-shrink-0 p-3 font-semibold border-r border-gray-200 bg-gray-50 text-gray-800">
              Project
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

          {/* 项目行 - Project Rows */}
          {Object.entries(itemsByStatus).map(([status, statusItems]) => (
            <div key={status}>
              <div className="flex border-b border-gray-100 bg-gray-50">
                <div className="w-40 flex-shrink-0 p-3 font-semibold border-r border-gray-200 text-gray-800">
                  {status}
                </div>
                <div className="flex-1"></div>
              </div>

              {statusItems.map(item => {
                const position = getItemPosition(item);

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => item.type === 'sprint' ? onSprintClick(item) : onTaskClick(item)}
                  >
                    <div className="w-40 flex-shrink-0 p-3 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        {item.type === 'sprint' && (
                          <span className="text-green-600">🚀</span>
                        )}
                        <div className="font-semibold text-sm truncate text-gray-800" title={item.title || item.name}>
                          {item.type === 'sprint' ? `Sprint: ${item.name}` : item.title}
                        </div>
                      </div>
                      {item.assignee && (
                        <div className="text-xs text-gray-600 mt-1 truncate">
                          Assignee: {item.assignee.name}
                        </div>
                      )}
                      {item.dueDate && (
                        <div className="text-xs text-gray-600 truncate">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="relative min-h-[60px]" style={{ width: `${days.length * 48}px` }}>
                      {position && (
                        <div
                          className={`absolute top-2 h-8 rounded-lg flex items-center justify-center text-white text-xs px-2 cursor-pointer transition-colors ${
                            item.type === 'sprint' 
                              ? 'bg-green-500 hover:bg-green-600 font-semibold' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                          style={{
                            left: position.left,
                            width: position.width,
                            maxWidth: position.width
                          }}
                          title={`${item.type === 'sprint' ? `Sprint: ${item.name}` : item.title} - ${new Date(item.dueDate).toLocaleDateString()}`}
                        >
                          <span className="truncate font-medium">
                            {item.type === 'sprint' ? `🚀 ${item.name}` : item.title}
                          </span>
                        </div>
                      )}

                      {/* 今日线 - Today Line */}
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

          {/* 未设置时间的项目 - Items without due date */}
          {allItems.filter(item => !item.dueDate).length > 0 && (
            <div>
              <div className="flex border-b border-gray-100 bg-gray-50">
                <div className="w-40 flex-shrink-0 p-3 font-semibold border-r border-gray-200 text-gray-800">
                  No Due Date
                </div>
                <div className="flex-1"></div>
              </div>
              {allItems.filter(item => !item.dueDate).map(item => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => item.type === 'sprint' ? onSprintClick(item) : onTaskClick(item)}
                >
                  <div className="w-40 flex-shrink-0 p-3 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      {item.type === 'sprint' && (
                        <span className="text-green-600">🚀</span>
                      )}
                      <div className="font-semibold text-sm truncate text-gray-800">
                        {item.type === 'sprint' ? `Sprint: ${item.name}` : item.title}
                      </div>
                    </div>
                    {item.assignee && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        Assignee: {item.assignee.name}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">No due date set</div>
                  </div>
                  <div className="flex-1 p-3 text-gray-600 text-sm">
                    Please set a due date in details to display on timeline
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

// 列表视图组件 - List View Component
const ListView = ({ tasks, sprints, onTaskClick, onSprintClick }) => {
  const allItems = useMemo(() => {
    const taskItems = tasks.map(task => ({ ...task, type: 'task' }));
    const sprintItems = sprints.map(sprint => ({ ...sprint, type: 'sprint' }));
    return [...taskItems, ...sprintItems].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  }, [tasks, sprints]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Project Timeline</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {allItems.map(item => (
          <div
            key={`${item.type}-${item.id}`}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => item.type === 'sprint' ? onSprintClick(item) : onTaskClick(item)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {item.type === 'sprint' && (
                    <span className="text-green-600 text-lg">🚀</span>
                  )}
                  <h4 className="font-medium text-gray-900">
                    {item.type === 'sprint' ? `Sprint: ${item.name}` : item.title}
                  </h4>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right text-sm">
                {item.dueDate ? (
                  <div className={`px-2 py-1 rounded ${
                    new Date(item.dueDate) < new Date() 
                      ? 'bg-red-100 text-red-800' 
                      : item.type === 'sprint'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-gray-500">No due date</div>
                )}
                {item.estimatedHours && (
                  <div className="text-gray-600 mt-1">Est: {item.estimatedHours}h</div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Type: {item.type === 'sprint' ? 'Sprint' : 'Task'}</span>
              <span>Status: {item.status}</span>
              {item.type === 'task' && (
                <span>Assignee: {item.assignee?.name || 'Unassigned'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 日期项目列表组件 - Date Items List Component
const DayItemsList = ({ date, items, onClose, onTaskClick, onSprintClick }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          Items on {new Date(date).toLocaleDateString()} ({items.length} items)
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={`${item.type}-${item.id}`}
            className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => item.type === 'sprint' ? onSprintClick(item) : onTaskClick(item)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {item.type === 'sprint' && (
                  <span className="text-green-600">🚀</span>
                )}
                <span className="font-medium">
                  {item.type === 'sprint' ? `Sprint: ${item.name}` : item.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{item.status}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.type === 'sprint' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.type === 'sprint' ? 'Sprint' : 'Task'}
                </span>
              </div>
            </div>
            {item.assignee && (
              <div className="text-sm text-gray-600 mt-1">
                Assignee: {item.assignee.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 主时间线视图组件 - Main Timeline View Component
const EnhancedTimelineView = ({ tasks, sprints }) => {
  const [currentView, setCurrentView] = useState('timeline');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayItems, setSelectedDayItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleSprintClick = (sprint) => {
    setSelectedSprint(sprint);
  };

  const handleDateClick = (date, dayItems) => {
    if (dayItems.length > 0) {
      setSelectedDate(date);
      setSelectedDayItems(dayItems);
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

  const handleCloseDayItems = () => {
    setSelectedDayItems([]);
    setSelectedDate(null);
  };

  const allItems = useMemo(() => {
    const taskItems = tasks.map(task => ({ ...task, type: 'task' }));
    const sprintItems = sprints.map(sprint => ({ ...sprint, type: 'sprint' }));
    return [...taskItems, ...sprintItems];
  }, [tasks, sprints]);

  if (allItems.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-md p-8 text-center">
        <p className="text-gray-500">No project data available</p>
        <p className="text-sm text-gray-400 mt-2">Please create tasks or sprints and set due dates on the project page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 视图切换按钮区域 - View Switcher */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
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
              List View
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 rounded text-sm ${
                currentView === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setCurrentView('timeline')}
              className={`px-4 py-2 rounded text-sm ${
                currentView === 'timeline' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Timeline View
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Showing {allItems.filter(t => t.dueDate).length}/{allItems.length} items with due dates
            (Tasks: {tasks.filter(t => t.dueDate).length}, Sprints: {sprints.filter(s => s.dueDate).length})
          </div>
        </div>
      </div>

      {/* 日期项目列表 - Date Items List */}
      {selectedDayItems.length > 0 && (
        <DayItemsList
          date={selectedDate}
          items={selectedDayItems}
          onClose={handleCloseDayItems}
          onTaskClick={handleTaskClick}
          onSprintClick={handleSprintClick}
        />
      )}

      {/* 各视图内容 - View Content */}
      {currentView === 'list' && (
        <ListView
          tasks={tasks}
          sprints={sprints}
          onTaskClick={handleTaskClick}
          onSprintClick={handleSprintClick}
        />
      )}

      {currentView === 'calendar' && (
        <CalendarView
          tasks={tasks}
          sprints={sprints}
          currentDate={currentDate}
          onDateClick={handleDateClick}
          onMonthChange={navigateMonth}
          onTodayClick={handleTodayClick}
          onSprintClick={handleSprintClick}
        />
      )}

      {currentView === 'timeline' && (
        <TimelineView
          tasks={tasks}
          sprints={sprints}
          onTaskClick={handleTaskClick}
          onSprintClick={handleSprintClick}
        />
      )}

      {/* 详情模态框 - Detail Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {selectedSprint && (
        <SprintDetailModal
          sprint={selectedSprint}
          onClose={() => setSelectedSprint(null)}
        />
      )}
    </div>
  );
};

// 主页面组件 - Main Page Component
export default function TimelinePage() {
  const { projectId } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
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
      console.error("Failed to fetch projects:", error);
      setAllProjects([]);
      setCurrentProject(null);
    }
  }, []);

  const fetchTimelineData = useCallback(async (projectId, userId) => {
    if (!projectId || !userId) return;

    setLoading(true);
    setError("");

    try {
      // Get the data of tasks and sprints in parallel
      const [tasksRes, sprintsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/timeline?userId=${userId}`),
        fetch(`/api/projects/${projectId}/sprint?userId=${userId}`)
      ]);

      if (!tasksRes.ok) {
        const errorText = await tasksRes.text();
        throw new Error(`Tasks API Error: ${tasksRes.status} - ${errorText}`);
      }

      if (!sprintsRes.ok) {
        const errorText = await sprintsRes.text();
        throw new Error(`Sprints API Error: ${sprintsRes.status} - ${errorText}`);
      }

      const tasksData = await tasksRes.json();
      const sprintsData = await sprintsRes.json();

      setTasks(tasksData.tasks || []);
      setSprints(sprintsData.sprints || []);

    } catch (error) {
      console.error("Load failed:", error);
      setError(error.message || "Load failed");
      setTasks([]);
      setSprints([]);
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
      console.error("Failed to parse user info:", error);
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-md p-8 text-center">
            <div className="text-gray-500">Loading...</div>
            <div className="text-sm text-gray-400 mt-2">Fetching data</div>
          </div>
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-red-800 font-medium">Load Failed</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => fetchTimelineData(Number(projectId), user?.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
                <Link
                  href={`/projects/${projectId}`}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Back to Board
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allItems = [...tasks, ...sprints];
  const itemsWithDueDate = [...tasks.filter(t => t.dueDate), ...sprints.filter(s => s.dueDate)];
  const overdueItems = [...tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()), ...sprints.filter(s => s.dueDate && new Date(s.dueDate) < new Date())];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ProjectSidebar
        allProjects={allProjects}
        currentProjectId={projectId}
      />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="mb-6">
          <Link href={`/projects/${projectId}`}>
            <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
              ← Back to Board
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {currentProject?.name || 'Project'} - Timeline
          </h1>
          <p className="text-gray-600">
            View the time distribution and due dates of tasks and sprints
          </p>
        </div>

        {/* 统计卡片区域 - Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
            <div className="text-2xl font-bold text-blue-600">{allItems.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Items</div>
            <div className="text-xs text-gray-500 mt-1">
              Tasks: {tasks.length} | Sprints: {sprints.length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {itemsWithDueDate.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">With Due Dates</div>
            <div className="text-xs text-gray-500 mt-1">
              Tasks: {tasks.filter(t => t.dueDate).length} | Sprints: {sprints.filter(s => s.dueDate).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
            <div className="text-2xl font-bold text-orange-600">
              {overdueItems.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Overdue Items</div>
            <div className="text-xs text-gray-500 mt-1">
              Tasks: {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length} | Sprints: {sprints.filter(s => s.dueDate && new Date(s.dueDate) < new Date()).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Estimated Hours</div>
            <div className="text-xs text-gray-500 mt-1">Task only</div>
          </div>
        </div>

        {/* 主内容区域 - Main Content */}
        <div className="overflow-hidden">
          <EnhancedTimelineView tasks={tasks} sprints={sprints} />
        </div>
      </div>
    </div>
  );
}