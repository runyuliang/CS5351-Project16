"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [inviteInputs, setInviteInputs] = useState({});

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
          memberEmails: memberEmails.split(",").map((e) => e.trim()),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Create project response:", data);

        alert(`Project "${data.name}" created!`);
        setGroups((prev) => [...prev, data]);
        setShowModal(false);
        setProjectName("");
        setMemberEmails("");
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const isAdmin = (project) => currentUser && project.adminId === currentUser.id;

  const handleInviteMembers = async (projectId) => {
    if (!currentUser) return;
    const emails = (inviteInputs[projectId] || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return;
    try {
      const res = await fetch("/api/project/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, adminId: currentUser.id, memberEmails: emails }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Invite failed");
      setGroups((prev) => prev.map((p) => (p.id === projectId ? data : p)));
      setInviteInputs((prev) => ({ ...prev, [projectId]: "" }));
    } catch (e) {
      console.error(e);
    }
  };

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
      setGroups((prev) => prev.map((p) => (p.id === projectId ? data : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!currentUser) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/project/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, adminId: currentUser.id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Delete failed");
      setGroups((prev) => prev.filter((p) => p.id !== projectId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Project
        </button>
      </div>

      {groups.length === 0 ? (
        <p>You are not in any project yet.</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.id} className="p-4 border border-gray-200 rounded-lg bg-white">
              {/* 新增View按钮区域 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong className="text-gray-900">{g.name}</strong>
                  {g.admin && (
                    <span className="text-xs text-gray-500">Admin: {g.admin.name || g.admin.email}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {/* 新增View按钮，点击跳转到看板页面 */}
                  <Link href={`/projects/${g.id}`}>
                    <button
                      className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View
                    </button>
                  </Link>
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

              <div className="mt-3">
                <div className="text-base text-gray-700 mb-1">Members</div>
                <div className="flex flex-wrap gap-2">
                  {(g.members || []).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-3 py-2 rounded border border-gray-200 bg-gray-50"
                    >
                      <span className="text-base text-gray-900">
                        {m.name || m.email}
                        {m.name ? (
                          <span className="text-gray-500"> ({m.email})</span>
                        ) : null}
                        <span className="text-gray-600"> — {m.id === g.adminId ? "Admin" : "Member"}</span>
                      </span>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create Project</h2>
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <textarea
              placeholder="Invite members by email (comma separated)"
              value={memberEmails}
              onChange={(e) => setMemberEmails(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              rows="3"
            ></textarea>
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