import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await req.json();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,          // 用户参与的项目
        managedProjects: true,   // 用户管理的项目
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ projects: user.projects });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
