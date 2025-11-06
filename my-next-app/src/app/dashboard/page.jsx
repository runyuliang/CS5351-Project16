"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const fetchGroups = async () => {
      try {
        const user = JSON.parse(storedUser);
        const res = await fetch("/api/user/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        console.log("Adding project:", data);
        setGroups((prev) => {
          const combined = [...prev, ...data.projects];
          const unique = combined.filter((p, index, self) =>
            index === self.findIndex((t) => t.id === p.id)
          );
          return unique;
        });
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
        console.log(data.id)
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
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.id} className="p-3 border rounded">
              <strong>{g.name}</strong>
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
