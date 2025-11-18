// PATCH /api/projects/[projectId]/sprint/[sprintId]/status
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { sprintId } = params;
  const { status } = await req.json();

  if (!["未开始", "正在冲刺", "完成"].includes(status)) {
    return new Response("Invalid status", { status: 400 });
  }

  try {
    const { springId } = params;
    const sprintId = Number(springId);
    // 先更新 Sprint 状态
    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: { status },
      include: { tasks: true },
    });

    // 如果是完成状态，检查任务
    if (status === "完成") {
      const tasksToBacklog = sprint.tasks.filter(t => t.status !== "完成");
      const tasksToDelete = sprint.tasks.filter(t => t.status === "完成");

      // 移回 backlog
      for (const task of tasksToBacklog) {
        await prisma.boardTask.update({
          where: { id: task.id },
          data: { sprintId: null } // 设置为 backlog
        });
      }

      // 删除已完成任务
      for (const task of tasksToDelete) {
        await prisma.boardTask.delete({
          where: { id: task.id }
        });
      }
    }

    return new Response(JSON.stringify(sprint), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("更新失败", { status: 500 });
  }
}
