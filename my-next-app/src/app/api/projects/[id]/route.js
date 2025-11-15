import { NextResponse } from 'next/server';

// GET /api/projects/[id]
export async function GET(request, { params }) {
  const { id } = params;

  try {
    // 返回模拟的项目数据
    const project = {
      id: parseInt(id),
      name: `项目 ${id}`,
      description: `这是项目 ${id} 的详细描述信息`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: '获取项目数据失败' },
      { status: 500 }
    );
  }
}