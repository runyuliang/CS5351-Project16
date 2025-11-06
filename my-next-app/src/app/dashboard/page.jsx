"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // console.log(user)
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
        console.log("Fetched groups:", data.groups);
        setGroups(data.groups || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [router]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Groups</h1>
      {groups.length === 0 ? (
        <p>You are not in any group yet.</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.id} className="p-3 border rounded">
              <strong>{g.name}</strong>
              <p>Admin: {g.adminId}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
