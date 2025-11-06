import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { projectId, adminId, memberEmails = [] } = await req.json();
    if (!projectId || !adminId || !Array.isArray(memberEmails)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { admin: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.adminId !== adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (memberEmails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    const usersToInvite = await prisma.user.findMany({
      where: { email: { in: memberEmails } },
      select: { id: true },
    });

    if (usersToInvite.length === 0) {
      return NextResponse.json({ error: "No matching users found" }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: usersToInvite.map((u) => ({ id: u.id })),
        },
      },
      include: { admin: true, members: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error inviting members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


