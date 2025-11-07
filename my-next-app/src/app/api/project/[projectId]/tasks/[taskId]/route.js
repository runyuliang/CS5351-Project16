import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET：获取单个任务详情
export async function GET(req, { params }) {
  try {
    const { projectId, taskId } = await params;
    const projectIdInt = parseInt(projectId, 10);
    const taskIdInt = parseInt(taskId, 10);

    if (isNaN(projectIdInt) || isNaN(taskIdInt)) {
      return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskIdInt },
      include: { status: true, project: true }
    });

    if (!task || task.projectId !== projectIdInt) {
      return NextResponse.json({ error: '任务未找到' }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    return NextResponse.json({ error: '获取任务详情失败' }, { status: 500 });
  }
}

// PUT：更新任务
export async function PUT(req, { params }) {
  try {
    const { projectId, taskId } = await params;
    const projectIdInt = parseInt(projectId, 10);
    const taskIdInt = parseInt(taskId, 10);
    const { title, description, tags, statusId } = await req.json();

    if (isNaN(projectIdInt) || isNaN(taskIdInt)) {
      return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
    }

    // 验证任务存在
    const task = await prisma.task.findUnique({
      where: { id: taskIdInt }
    });

    if (!task || task.projectId !== projectIdInt) {
      return NextResponse.json({ error: '任务未找到' }, { status: 404 });
    }

    // 如果更新状态，验证新状态是否属于同一项目
    if (statusId) {
      const newStatus = await prisma.status.findUnique({
        where: { id: statusId }
      });

      if (!newStatus || newStatus.projectId !== projectIdInt) {
        return NextResponse.json({ error: '状态未找到或不属于此项目' }, { status: 404 });
      }
    }

    // 更新任务
    const updatedTask = await prisma.task.update({
      where: { id: taskIdInt },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        tags: tags !== undefined ? tags : task.tags,
        statusId: statusId !== undefined ? statusId : task.statusId
      }
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('更新任务失败:', error);
    return NextResponse.json({ error: '更新任务失败' }, { status: 500 });
  }
}

// DELETE：删除任务
export async function DELETE(req, { params }) {
  try {
    const { projectId, taskId } = await params;
    const projectIdInt = parseInt(projectId, 10);
    const taskIdInt = parseInt(taskId, 10);

    if (isNaN(projectIdInt) || isNaN(taskIdInt)) {
      return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskIdInt }
    });

    if (!task || task.projectId !== projectIdInt) {
      return NextResponse.json({ error: '任务未找到' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskIdInt }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('删除任务失败:', error);
    return NextResponse.json({ error: '删除任务失败' }, { status: 500 });
  }
}

