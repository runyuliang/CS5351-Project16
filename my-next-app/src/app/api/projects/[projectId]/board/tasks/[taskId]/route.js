import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/projectAccess";

export async function PATCH(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);
    const taskId = Number(params.taskId);

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
      assigneeId,
      title,
      description,
      tags,
      columnId,
      position,
      dueDate,
      estimatedHours,
      actualHours
    } = body;

    console.log("Received task update data:", {
      userId, taskId, dueDate, estimatedHours, actualHours
    });

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

    // 修复时间字段处理
    if (typeof dueDate !== "undefined") {
      data.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (typeof estimatedHours !== "undefined") {
      data.estimatedHours = estimatedHours !== null && estimatedHours !== '' ? Number(estimatedHours) : null;
    }

    if (typeof actualHours !== "undefined") {
      data.actualHours = actualHours !== null && actualHours !== '' ? Number(actualHours) : null;
    }

    console.log("Updating task with data:", data);

    const updated = await prisma.boardTask.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    const responseData = {
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
      assignee: updated.assignee
        ? {
            id: updated.assignee.id,
            name: updated.assignee.name,
            email: updated.assignee.email,
          }
        : null,
    };

    console.log("Task updated successfully:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task: " + error.message },
      { status: 500 }
    );
  }
}