import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 初始化 Prisma 客户端
const prisma = new PrismaClient();

/**
 * 检查用户对项目的访问权限（完全适配你的 Prisma Schema）
 * @param {number} projectId - 项目 ID
 * @param {number} userId - 用户 ID
 * @returns {Promise<{ error?: string; status?: number; project?: any }>}
 */
async function getProjectWithAccess(projectId, userId) {
  try {
    // 查找项目，并通过关联查询验证用户是否是成员或管理员
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        // 关联查询项目成员（ProjectMembers 关联）
        members: {
          where: { id: userId }, // 直接过滤用户 ID（适配直接多对多关联）
          select: { id: true }, // 只查询必要字段，优化性能
        },
        // 关联查询项目管理员（ProjectAdmins 关联）
        admin: {
          select: { id: true }, // 用于验证是否是管理员
        },
      },
    });

    // 检查项目是否存在
    if (!project) {
      return { error: 'Project not found', status: 404 };
    }

    // 验证用户权限：是项目管理员 或 是项目成员
    const isAdmin = project.admin.id === userId;
    const isMember = project.members.length > 0;
    const hasAccess = isAdmin || isMember;

    if (!hasAccess) {
      return { error: 'You do not have permission to modify this project', status: 403 };
    }

    return { project };
  } catch (error) {
    console.error('Error checking project access:', error);
    return { error: 'Failed to verify project access', status: 500 };
  }
}

export async function PATCH(req, context) {
  try {
    const params = await context.params;
    const projectId = Number(params.projectId);
    const taskId = Number(params.taskId);

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
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
      status
    } = body;

    // 验证必要参数
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 检查项目访问权限（现在完全适配你的数据模型）
    const access = await getProjectWithAccess(projectId, Number(userId));
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // 查找任务（验证任务属于当前项目）
    const task = await prisma.boardTask.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const data = {};

    // 更新负责人（支持取消分配）
    if (typeof assigneeId !== "undefined") {
      // 如果要分配用户，验证该用户是否是项目成员或管理员
      if (assigneeId !== null && assigneeId !== "") {
        const assigneeUserId = Number(assigneeId);
        // 检查被分配人是否是项目成员或管理员
        const isAssigneeMember = access.project.members.some(m => m.id === assigneeUserId);
        const isAssigneeAdmin = access.project.admin.id === assigneeUserId;

        if (!isAssigneeMember && !isAssigneeAdmin) {
          return NextResponse.json(
            { error: "The user you're trying to assign is not a member or admin of this project" },
            { status: 403 }
          );
        }
      }
      data.assigneeId = assigneeId === null || assigneeId === "" ? null : Number(assigneeId);
    }

    // 更新标题
    if (typeof title === "string") {
      data.title = title.trim();
    }

    // 更新描述
    if (typeof description !== "undefined") {
      data.description = description?.trim() || null;
    }

    // 更新标签（确保是数组类型）
    if (Array.isArray(tags)) {
      data.tags = tags.filter(tag => typeof tag === "string" && tag.trim()); // 过滤无效标签
    }

    // 更新列ID（验证列属于当前项目）
    if (typeof columnId !== "undefined") {
      const column = await prisma.boardColumn.findFirst({
        where: { id: Number(columnId), projectId },
      });
      if (!column) {
        return NextResponse.json({ error: "Target column not found in project" }, { status: 404 });
      }
      data.columnId = column.id;
    }

    // 更新位置
    if (typeof position === "number") {
      data.position = position;
    }

    // 时间字段更新（标准化日期格式）
    if (typeof dueDate !== "undefined") {
      data.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // 预估工时（确保是数字或 null）
    if (typeof estimatedHours !== "undefined") {
      data.estimatedHours = estimatedHours !== null && estimatedHours !== ''
        ? Number(estimatedHours)
        : null;
    }

    // 实际工时（确保是数字或 null）
    if (typeof actualHours !== "undefined") {
      data.actualHours = actualHours !== null && actualHours !== ''
        ? Number(actualHours)
        : null;
    }

    // 状态更新（只允许指定的中文状态值）
    if (typeof status === "string" && ["未开始", "进行中", "审核中", "完成"].includes(status)) {
      data.status = status;
    }

    // 执行任务更新（包含关联数据）
    const updated = await prisma.boardTask.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        column: { select: { id: true, name: true } },
      },
    });

    // 格式化响应（与前端预期格式一致）
    return NextResponse.json({
      id: updated.id,
      numericId: updated.id, // 兼容前端 formatTask 函数
      title: updated.title,
      description: updated.description || '',
      tags: updated.tags || [],
      position: updated.position,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      columnId: updated.columnId,
      dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
      estimatedHours: updated.estimatedHours,
      actualHours: updated.actualHours,
      status: updated.status,
      column: updated.column,
      assignee: updated.assignee
        ? {
            id: updated.assignee.id,
            name: updated.assignee.name || updated.assignee.email || `User${updated.assignee.id}`,
            email: updated.assignee.email || '',
          }
        : null,
    });

  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({
      error: "Failed to update task: " + error.message
    }, { status: 500 });
  } finally {
    // 关闭 Prisma 连接
    await prisma.$disconnect();
  }
}