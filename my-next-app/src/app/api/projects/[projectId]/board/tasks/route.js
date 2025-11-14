export async function POST(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);
    const { 
      userId, 
      columnId, 
      title, 
      description, 
      tags = [], 
      assigneeId,
      dueDate,        // 新增
      estimatedHours  // 新增
    } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const access = await getProjectWithAccess(projectId, Number(userId));
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const column = await prisma.boardColumn.findFirst({
      where: { id: Number(columnId), projectId },
    });

    if (!column) {
      return NextResponse.json(
        { error: "Column not found for project" },
        { status: 404 }
      );
    }

    const lastTask = await prisma.boardTask.findFirst({
      where: { projectId, columnId: column.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const nextPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await prisma.boardTask.create({
      data: {
        projectId,
        columnId: column.id,
        title: title.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        assigneeId: assigneeId ? Number(assigneeId) : null,
        position: nextPosition,
        dueDate: dueDate ? new Date(dueDate) : null,           // 新增
        estimatedHours: estimatedHours ? Number(estimatedHours) : null, // 新增
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      tags: task.tags,
      position: task.position,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate,           // 新增
      estimatedHours: task.estimatedHours, // 新增
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}