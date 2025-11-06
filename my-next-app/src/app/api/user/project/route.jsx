import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { group: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ groups: user.group });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
