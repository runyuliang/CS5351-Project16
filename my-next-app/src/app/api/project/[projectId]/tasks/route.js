import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET：获取项目的所有任务和状态
export async function GET(req, { params }) {
  try {
    const { projectId } = await params;
    const projectIdInt = parseInt(projectId, 10);

    if (isNaN(projectIdInt)) {
      return NextResponse.json({ error: '无效的项目 ID' }, { status: 400 });
    }

    // 验证项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectIdInt }
    });

    if (!project) {
      return NextResponse.json({ error: '项目未找到' }, { status: 404 });
    }

    // 获取所有状态和相关任务
    const statuses = await prisma.status.findMany({
      where: { projectId: projectIdInt },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ statuses }, { status: 200 });
  } catch (error) {
    console.error('获取任务失败:', error);
    return NextResponse.json({ error: '获取任务失败' }, { status: 500 });
  }
}

// POST：创建新任务
export async function POST(req, { params }) {
  try {
    const { projectId } = await params;
    const projectIdInt = parseInt(projectId, 10);
    const { title, description, tags, statusId } = await req.json();

    if (isNaN(projectIdInt) || !title || !statusId) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 验证项目和状态是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectIdInt }
    });

    if (!project) {
      return NextResponse.json({ error: '项目未找到' }, { status: 404 });
    }

    const status = await prisma.status.findUnique({
      where: { id: statusId }
    });

    if (!status || status.projectId !== projectIdInt) {
      return NextResponse.json({ error: '状态未找到或不属于此项目' }, { status: 404 });
    }

    // 创建任务
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        tags: tags || [],
        projectId: projectIdInt,
        statusId
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('创建任务失败:', error);
    return NextResponse.json({ error: '创建任务失败' }, { status: 500 });
  }
}

