"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 新增：用于项目详情页跳转

export default function DashboardPage() {
  const router = useRouter();
  // 1. 保留所有原始状态：未新增/删除任何state
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [memberEmails, setMemberEmails] = useState(""); // 用于「创建项目时添加成员」
  const [currentUser, setCurrentUser] = useState(null);
  const [inviteInputs, setInviteInputs] = useState({}); // 用于「创建后邀请成员」

  // 2. 保留用户校验与项目列表获取逻辑：无修改
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const fetchGroups = async () => {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        const res = await fetch("/api/user/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        setGroups(data.projects || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [router]);

  // 3. 保留「创建项目」功能（含创建时添加成员）：无修改
  const handleCreateProject = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    try {
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          adminId: user.id,
          // 关键：创建项目时拆分邮箱列表（原始功能）
          memberEmails: memberEmails.split(",").map((e) => e.trim()),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Create project response:", data);
        alert(`Project "${data.name}" created!`);
        setGroups((prev) => [...prev, data]); // 更新项目列表
        setShowModal(false);
        // 清空输入框（原始功能）
        setProjectName("");
        setMemberEmails("");
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 4. 保留「判断是否为项目管理员」工具函数：无修改
  const isAdmin = (project) => currentUser && project.adminId === currentUser.id;

  // 5. 保留「创建后邀请成员」功能：无修改
  const handleInviteMembers = async (projectId) => {
    if (!currentUser) return;
    // 拆分并过滤邮箱（去除空值）
    const emails = (inviteInputs[projectId] || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return; // 空邮箱不发起请求
    try {
      const res = await fetch("/api/project/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, adminId: currentUser.id, memberEmails: emails }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Invite failed");
      setGroups((prev) => prev.map((p) => (p.id === projectId ? data : p))); // 更新项目成员
      setInviteInputs((prev) => ({ ...prev, [projectId]: "" })); // 清空邀请输入框
    } catch (e) {
      console.error(e);
    }
  };

  // 6. 保留「移除项目成员」功能：无修改
  const handleRemoveMember = async (projectId, memberId) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/project/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, adminId: currentUser.id, memberId }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Remove failed");
      setGroups((prev) => prev.map((p) => (p.id === projectId ? data : p))); // 更新项目成员
    } catch (e) {
      console.error(e);
    }
  };

  // 7. 保留「删除项目」功能：无修改
  const handleDeleteProject = async (projectId) => {
    if (!currentUser) return;
    if (!confirm("Delete this project? This cannot be undone.")) return; // 二次确认（原始功能）
    try {
      const res = await fetch("/api/project/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, adminId: currentUser.id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Delete failed");
      setGroups((prev) => prev.filter((p) => p.id !== projectId)); // 从列表中移除删除的项目
    } catch (e) {
      console.error(e);
    }
  };

  // 加载中状态（原始功能）
  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      {/* 顶部标题与「创建项目」按钮（原始功能） */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Project
        </button>
      </div>

      {/* 项目列表：无项目时提示（原始功能） */}
      {groups.length === 0 ? (
        <p>You are not in any project yet.</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.id} className="p-4 border border-gray-200 rounded-lg bg-white">
              {/* 新增：View按钮（与Delete按钮并列，不影响原始功能） */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong className="text-gray-900">{g.name}</strong>
                  {/* 显示项目管理员（原始功能） */}
                  {g.admin && (
                    <span className="text-xs text-gray-500">Admin: {g.admin.name || g.admin.email}</span>
                  )}
                </div>
                {/* 按钮组：新增View按钮 + 保留Delete按钮（仅管理员可见） */}
                <div className="flex gap-2">
                  {/* 新增：跳转到项目详情页（/projects/项目ID） */}
                  <Link href={`/projects/${g.id}`}>
                    <button className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">
                      View
                    </button>
                  </Link>
                  {/* 保留：删除项目按钮（仅管理员可见，原始功能） */}
                  {isAdmin(g) && (
                    <button
                      onClick={() => handleDeleteProject(g.id)}
                      className="px-3 py-1.5 text-sm rounded bg-rose-500 text-white hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* 保留：项目成员列表（含移除成员功能） */}
              <div className="mt-3">
                <div className="text-base text-gray-700 mb-1">Members</div>
                <div className="flex flex-wrap gap-2">
                  {(g.members || []).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-3 py-2 rounded border border-gray-200 bg-gray-50"
                    >
                      {/* 显示成员名称/邮箱 + 角色（原始功能） */}
                      <span className="text-base text-gray-900">
                        {m.name || m.email}
                        {m.name ? <span className="text-gray-500"> ({m.email})</span> : null}
                        <span className="text-gray-600"> — {m.id === g.adminId ? "Admin" : "Member"}</span>
                      </span>
                      {/* 保留：移除成员按钮（仅管理员可见，且不能移除自己） */}
                      {isAdmin(g) && m.id !== g.adminId && (
                        <button
                          onClick={() => handleRemoveMember(g.id, m.id)}
                          className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 保留：邀请成员输入框（仅管理员可见，原始功能） */}
              {isAdmin(g) && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Invite emails, comma separated"
                    value={inviteInputs[g.id] || ""}
                    onChange={(e) => setInviteInputs((prev) => ({ ...prev, [g.id]: e.target.value }))}
                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => handleInviteMembers(g.id)}
                    className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Invite
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 保留：创建项目模态框（含成员邮箱输入，原始功能） */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create Project</h2>
            {/* 项目名称输入（原始功能） */}
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            {/* 保留：创建项目时的成员邮箱输入（多行文本框，原始功能） */}
            <textarea
              placeholder="Invite members by email (comma separated)"
              value={memberEmails}
              onChange={(e) => setMemberEmails(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              rows="3"
            ></textarea>
            {/* 取消/创建按钮（原始功能） */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}