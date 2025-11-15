import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/projectAccess";

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

    // 获取项目的所有任务，包括时间信息
    const tasks = await prisma.boardTask.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        column: {
          select: { id: true, name: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // 格式化返回数据，专门为 Timeline 优化
    const timelineData = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      tags: task.tags,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignee: task.assignee ? {
        id: task.assignee.id,
        name: task.assignee.name,
        email: task.assignee.email,
      } : null,
      column: task.column ? {
        id: task.column.id,
        name: task.column.name,
      } : null,
      status: task.column?.name || '未分类'
    }));

    return NextResponse.json({
      project: {
        id: access.project.id,
        name: access.project.name
      },
      tasks: timelineData,
      // 添加时间范围信息，用于 Timeline 视图
      dateRange: {
        start: timelineData.length > 0 ?
          new Date(Math.min(...timelineData.filter(t => t.dueDate).map(t => new Date(t.dueDate)))) :
          new Date(),
        end: timelineData.length > 0 ?
          new Date(Math.max(...timelineData.filter(t => t.dueDate).map(t => new Date(t.dueDate)))) :
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 默认30天后
      }
    });
  } catch (error) {
    console.error("Failed to load timeline data:", error);
    return NextResponse.json(
      { error: "Failed to load timeline data" },
      { status: 500 }
    );
  }
}