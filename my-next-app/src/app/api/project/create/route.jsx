import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDefaultBoardColumns } from "@/lib/projectAccess";

export async function POST(req) {
  try {
    const { name, adminId, memberEmails = [] } = await req.json();
    // 获取成员 ID 列表
    const members = await prisma.user.findMany({
      where: {
        email: { in: memberEmails },
      },
      select: { id: true },
    });
    // 确保管理员也在成员中
    const allMemberIds = [...new Set([...members.map(m => m.id), adminId])];
    console.log(5555)
    console.log(allMemberIds)
    // 创建项目
    const project = await prisma.project.create({
      data: {
        name,
        admin: { connect: { id: adminId } },
        members: {
          connect: allMemberIds.map(id => ({ id })),
        },
      },
      include: {
        admin: true,
        members: true,
      },
    });


    return NextResponse.json(project);
  } catch (error) {
    console.error("❌ Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
