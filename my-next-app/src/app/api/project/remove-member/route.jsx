import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { projectId, adminId, memberId, memberEmail } = await req.json();
    if (!projectId || !adminId || (!memberId && !memberEmail)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.adminId !== adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let targetUserId = memberId;
    if (!targetUserId && memberEmail) {
      const user = await prisma.user.findUnique({ where: { email: memberEmail }, select: { id: true } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      targetUserId = user.id;
    }

    // Prevent removing the admin from members
    if (targetUserId === project.adminId) {
      return NextResponse.json({ error: "Cannot remove project admin" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        members: { disconnect: [{ id: targetUserId }] },
      },
      include: { admin: true, members: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


