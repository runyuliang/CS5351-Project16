import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT：更新状态列
export async function PUT(req, { params }) {
  try {
    const { projectId, statusId } = await params;
    const projectIdInt = parseInt(projectId, 10);
    const statusIdInt = parseInt(statusId, 10);
    const { name } = await req.json();

    if (isNaN(projectIdInt) || isNaN(statusIdInt) || !name) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 验证状态是否存在且属于该项目
    const status = await prisma.status.findUnique({
      where: { id: statusIdInt }
    });

    if (!status || status.projectId !== projectIdInt) {
      return NextResponse.json({ error: '状态未找到' }, { status: 404 });
    }

    // 更新状态
    const updatedStatus = await prisma.status.update({
      where: { id: statusIdInt },
      data: { name }
    });

    return NextResponse.json(updatedStatus, { status: 200 });
  } catch (error) {
    console.error('更新状态列失败:', error);
    return NextResponse.json({ error: '更新状态列失败' }, { status: 500 });
  }
}

// DELETE：删除状态列
export async function DELETE(req, { params }) {
  try {
    const { projectId, statusId } = await params;
    const projectIdInt = parseInt(projectId, 10);
    const statusIdInt = parseInt(statusId, 10);

    if (isNaN(projectIdInt) || isNaN(statusIdInt)) {
      return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
    }

    // 验证状态是否存在且属于该项目
    const status = await prisma.status.findUnique({
      where: { id: statusIdInt }
    });

    if (!status || status.projectId !== projectIdInt) {
      return NextResponse.json({ error: '状态未找到' }, { status: 404 });
    }

    // 删除状态（关联的任务会因为级联删除也被删除）
    await prisma.status.delete({
      where: { id: statusIdInt }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('删除状态列失败:', error);
    return NextResponse.json({ error: '删除状态列失败' }, { status: 500 });
  }
}

