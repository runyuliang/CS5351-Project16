import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST：创建新的状态列
export async function POST(req, { params }) {
  try {
    const { projectId } = await params;
    const projectIdInt = parseInt(projectId, 10);
    const { name } = await req.json();

    if (isNaN(projectIdInt) || !name) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 验证项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectIdInt }
    });

    if (!project) {
      return NextResponse.json({ error: '项目未找到' }, { status: 404 });
    }

    // 创建状态
    const status = await prisma.status.create({
      data: {
        name,
        projectId: projectIdInt
      }
    });

    return NextResponse.json(status, { status: 201 });
  } catch (error) {
    console.error('创建状态列失败:', error);
    return NextResponse.json({ error: '创建状态列失败' }, { status: 500 });
  }
}

