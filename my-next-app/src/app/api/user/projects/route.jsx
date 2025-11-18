import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    // 1. 解析请求体并校验参数
    const body = await req.json();
    const { userId } = body;

    // 检查userId是否存在
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 } // 400表示请求参数错误
      );
    }

    // 2. 查询用户及关联的所有项目（包括参与的和管理的）
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // 用户作为成员参与的项目
        projects: {
          include: {
            admin: { select: { id: true, name: true, email: true } }, // 只返回必要的管理员信息
            members: { select: { id: true, name: true, email: true } } // 只返回必要的成员信息
          }
        },
        // 用户作为管理员创建的项目（原代码未返回这部分）
        managedProjects: {
          include: {
            admin: { select: { id: true, name: true, email: true } },
            members: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // 3. 处理用户不存在的情况
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 4. 合并项目列表（去重，避免重复返回）
    const allProjects = [
      ...user.projects,
      ...user.managedProjects
    ].filter((project, index, self) => 
      // 根据项目id去重（如果同一个项目既在projects又在managedProjects中）
      self.findIndex(p => p.id === project.id) === index
    );

    // 5. 返回完整的项目列表
    return NextResponse.json({ projects: allProjects });

  } catch (error) {
    console.error("Error fetching user projects:", error);
    // 生产环境可隐藏具体错误信息
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}