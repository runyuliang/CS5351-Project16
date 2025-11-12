import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/projectAccess";

export async function POST(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);
    const { userId, updates } = await req.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "No column updates provided" },
        { status: 400 }
      );
    }

    const access = await getProjectWithAccess(projectId, Number(userId));
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const columnIds = updates.map((item) => Number(item.columnId));
    const uniqueColumnIds = [...new Set(columnIds)];

    const columns = await prisma.boardColumn.findMany({
      where: { projectId, id: { in: uniqueColumnIds } },
      select: { id: true },
    });

    if (columns.length !== uniqueColumnIds.length) {
      return NextResponse.json(
        { error: "One or more columns do not belong to this project" },
        { status: 400 }
      );
    }

    const taskIds = [
      ...new Set(
        updates.flatMap((item) =>
          Array.isArray(item.taskIds) ? item.taskIds.map((id) => Number(id)) : []
        )
      ),
    ];

    const tasks = await prisma.boardTask.findMany({
      where: { projectId, id: { in: taskIds } },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: "One or more tasks do not belong to this project" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      updates.flatMap((item) => {
        const columnId = Number(item.columnId);
        const ids = Array.isArray(item.taskIds)
          ? item.taskIds.map((id) => Number(id))
          : [];

        return ids.map((taskId, index) =>
          prisma.boardTask.update({
            where: { id: taskId },
            data: {
              columnId,
              position: index,
            },
          })
        );
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder tasks:", error);
    return NextResponse.json(
      { error: "Failed to reorder tasks" },
      { status: 500 }
    );
  }
}

