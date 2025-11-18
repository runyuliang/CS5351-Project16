import prisma from '@/lib/prisma';

export async function GET(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId'); // 可选

    const [sprints, backlogTasks] = await Promise.all([
      prisma.sprint.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        include: { tasks: { include: { assignee: true } } },
      }),
      prisma.boardTask.findMany({
        where: { projectId, sprintId: null },
        include: { assignee: true, column: true },
        orderBy: { position: 'asc' },
      }),
    ]);

    return new Response(JSON.stringify({ sprints, backlog: backlogTasks }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /sprint error', err);
    return new Response(JSON.stringify({ error: err.message || '获取 sprint 失败' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);

    const body = await req.json().catch(() => ({}));
    const name = body.name?.trim() || '';
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;

    const lastSprint = await prisma.sprint.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });
    const nextOrder = lastSprint ? lastSprint.order + 1 : 1;

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        name: name || `Sprint ${nextOrder}`,
        order: nextOrder,
        dueDate,
      },
    });

    return new Response(JSON.stringify(sprint), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /sprint error', err);
    return new Response(JSON.stringify({ error: err.message || '创建 sprint 失败' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
