import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ensureDefaultBoardColumns,
  getProjectWithAccess,
} from "@/lib/projectAccess";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);
    const searchParams = new URL(req.url).searchParams;
    const userId = Number(searchParams.get("userId"));

    const access = await getProjectWithAccess(projectId, userId);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    await ensureDefaultBoardColumns(projectId);

    const columns = await prisma.boardColumn.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: {
        tasks: {
          orderBy: { position: "asc" },
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      project: { id: access.project.id, name: access.project.name },
      columns: columns.map((column) => ({
        id: column.id,
        name: column.name,
        order: column.order,
        createdAt: column.createdAt,
        updatedAt: column.updatedAt,
        tasks: column.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          tags: task.tags,
          position: task.position,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          // ✅ 添加时间字段
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                name: task.assignee.name,
                email: task.assignee.email,
              }
            : null,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to load project board:", error);
    return NextResponse.json(
      { error: "Failed to load project board" },
      { status: 500 }
    );
  }
}