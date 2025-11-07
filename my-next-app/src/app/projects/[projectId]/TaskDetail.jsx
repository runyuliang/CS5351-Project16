import { useState } from "react";

export default function TaskDetail({ task, onSave, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    tags: task.tags.join(","),
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const updatedTask = {
      ...task,
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    onSave(updatedTask);
    setEditMode(false);
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">任务详情</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">标题</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">描述</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">标签 (逗号分隔)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setEditMode(false)}
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
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{task.title}</h3>
              
              {task.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">描述</h4>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{task.description}</p>
                </div>
              )}
              
              {task.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">标签</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.tags.map(tag => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                创建于: {task.createdAt}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  编辑任务
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}