export async function PATCH(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);
    const taskId = Number(params.taskId);
    const body = await req.json();
    const { 
      userId, 
      assigneeId, 
      title, 
      description, 
      tags, 
      columnId, 
      position,
      dueDate,        // 新增
      estimatedHours, // 新增
      actualHours     // 新增
    } = body;

    const access = await getProjectWithAccess(projectId, Number(userId));
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const task = await prisma.boardTask.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const data = {};

    if (typeof assigneeId !== "undefined") {
      if (assigneeId === null || assigneeId === "") {
        data.assigneeId = null;
      } else {
        data.assigneeId = Number(assigneeId);
      }
    }

    if (typeof title === "string") {
      data.title = title.trim();
    }

    if (typeof description !== "undefined") {
      data.description =
        description && description.trim().length > 0
          ? description.trim()
          : null;
    }

    if (Array.isArray(tags)) {
      data.tags = tags;
    }

    if (typeof columnId !== "undefined") {
      const column = await prisma.boardColumn.findFirst({
        where: { id: Number(columnId), projectId },
      });
      if (!column) {
        return NextResponse.json(
          { error: "Target column not found in project" },
          { status: 404 }
        );
      }
      data.columnId = column.id;
    }

    if (typeof position === "number") {
      data.position = position;
    }

    // 新增时间字段处理
    if (typeof dueDate !== "undefined") {
      data.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (typeof estimatedHours !== "undefined") {
      data.estimatedHours = estimatedHours ? Number(estimatedHours) : null;
    }

    if (typeof actualHours !== "undefined") {
      data.actualHours = actualHours ? Number(actualHours) : null;
    }

    const updated = await prisma.boardTask.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      tags: updated.tags,
      position: updated.position,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      columnId: updated.columnId,
      dueDate: updated.dueDate,           // 新增
      estimatedHours: updated.estimatedHours, // 新增
      actualHours: updated.actualHours,   // 新增
      assignee: updated.assignee
        ? {
            id: updated.assignee.id,
            name: updated.assignee.name,
            email: updated.assignee.email,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}