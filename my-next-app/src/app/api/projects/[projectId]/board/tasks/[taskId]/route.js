import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/projectAccess";

export async function PATCH(req, context) {
  try {
    const { params } = context;           // ✅ 正确获取 params
    const projectId = Number(params.projectId);
    const taskId = Number(params.taskId);

    // 解析请求体
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON解析错误:", parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const {
      userId,
      assigneeId,
      title,
      description,
      tags,
      columnId,
      position,
      dueDate,
      estimatedHours,
      actualHours,
      status // 新增 status 字段
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 检查用户项目访问权限
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

    // assignee 更新
    if (typeof assigneeId !== "undefined") {
      data.assigneeId = assigneeId === null || assigneeId === "" ? null : Number(assigneeId);
    }

    // title 更新
    if (typeof title === "string") data.title = title.trim();

    // description 更新
    if (typeof description !== "undefined") data.description = description?.trim() || null;

    // tags 更新
    if (Array.isArray(tags)) data.tags = tags;

    // columnId 更新
    if (typeof columnId !== "undefined") {
      const column = await prisma.boardColumn.findFirst({
        where: { id: Number(columnId), projectId },
      });
      if (!column) {
        return NextResponse.json({ error: "Target column not found in project" }, { status: 404 });
      }
      data.columnId = column.id;
    }

    // position 更新
    if (typeof position === "number") data.position = position;

    // 时间字段更新
    if (typeof dueDate !== "undefined") data.dueDate = dueDate ? new Date(dueDate) : null;
    if (typeof estimatedHours !== "undefined") data.estimatedHours = estimatedHours !== null && estimatedHours !== '' ? Number(estimatedHours) : null;
    if (typeof actualHours !== "undefined") data.actualHours = actualHours !== null && actualHours !== '' ? Number(actualHours) : null;

    // ===== status 更新 =====
    if (typeof status === "string" && ["未开始","进行中","完成"].includes(status)) {
      data.status = status;
    }

    // 执行更新
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
      dueDate: updated.dueDate,
      estimatedHours: updated.estimatedHours,
      actualHours: updated.actualHours,
      status: updated.status,
      assignee: updated.assignee
        ? { id: updated.assignee.id, name: updated.assignee.name, email: updated.assignee.email }
        : null,
    });

  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Failed to update task: " + error.message }, { status: 500 });
  }
}
