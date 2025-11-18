// src/app/api/projects/[projectId]/sprint/assign/route.js
import prisma from '@/lib/prisma';

export async function POST(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);

    const body = await req.json();
    const taskId = Number(body.taskId);
    const sprintId = body.sprintId === null ? null : Number(body.sprintId);

    const updatedTask = await prisma.boardTask.update({
      where: { id: taskId },
      data: { sprintId },
      include: { assignee: true },
    });

    return new Response(JSON.stringify(updatedTask), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /sprint/assign error', err);
    return new Response(JSON.stringify({ error: err.message || '更新任务失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
