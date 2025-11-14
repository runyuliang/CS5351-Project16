import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/projectAccess";

export async function POST(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);

    // 确保正确解析请求体
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON解析错误:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      userId,
      columnId,
      title,
      description,
      tags = [],
      assigneeId,
      dueDate,
      estimatedHours
    } = body;

    console.log("Received task creation data:", {
      userId, columnId, title, dueDate, estimatedHours
    });

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // 准备创建数据
    const createData = {
      projectId,
      columnId: column.id,
      title: title.trim(),
      description: description?.trim() || null,
      tags: Array.isArray(tags) ? tags : [],
      assigneeId: assigneeId ? Number(assigneeId) : null,
      position: nextPosition,
    };

    // 只有在有值的情况下才添加时间字段
    if (dueDate) {
      createData.dueDate = new Date(dueDate);
    }
    if (estimatedHours !== undefined && estimatedHours !== null && estimatedHours !== '') {
      createData.estimatedHours = Number(estimatedHours);
    }

    console.log("Creating task with data:", createData);

    const task = await prisma.boardTask.create({
      data: createData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const responseData = {
      id: task.id,
      title: task.title,
      description: task.description,
      tags: task.tags,
      position: task.position,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
    };

    console.log("Task created successfully:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task: " + error.message },
      { status: 500 }
    );
  }
}