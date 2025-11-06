import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { projectId, adminId } = await req.json();
    if (!projectId || !adminId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.adminId !== adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.project.delete({ where: { id: projectId } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


