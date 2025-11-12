import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/projectAccess";

export async function POST(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);
    const { userId, name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Column name is required" },
        { status: 400 }
      );
    }

    const access = await getProjectWithAccess(projectId, Number(userId));
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const lastColumn = await prisma.boardColumn.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = lastColumn ? lastColumn.order + 1 : 0;

    const column = await prisma.boardColumn.create({
      data: {
        projectId,
        name: name.trim(),
        order: nextOrder,
      },
    });

    return NextResponse.json({
      id: column.id,
      name: column.name,
      order: column.order,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
    });
  } catch (error) {
    console.error("Failed to create column:", error);
    return NextResponse.json(
      { error: "Failed to create column" },
      { status: 500 }
    );
  }
}

