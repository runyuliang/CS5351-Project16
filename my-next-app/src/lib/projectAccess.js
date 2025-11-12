import prisma from "@/lib/prisma";

export async function getProjectWithAccess(projectId, userId) {
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return { error: "Invalid project id", status: 400 };
  }
  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "Invalid user id", status: 400 };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      adminId: true,
      members: {
        where: { id: userId },
        select: { id: true },
      },
    },
  });

  if (!project) {
    return { error: "Project not found", status: 404 };
  }

  const isMember = project.adminId === userId || project.members.length > 0;

  if (!isMember) {
    return { error: "Forbidden", status: 403 };
  }

  return { project };
}

export async function ensureDefaultBoardColumns(projectId) {
  const existing = await prisma.boardColumn.findMany({
    where: { projectId },
  });

  if (existing.length > 0) {
    return existing;
  }

  const defaults = [
    { name: "Todo", order: 0 },
    { name: "In Progress", order: 1 },
    { name: "In Review", order: 2 },
    { name: "Done", order: 3 },
  ];

  await prisma.$transaction(
    defaults.map((column) =>
      prisma.boardColumn.create({
        data: {
          projectId,
          name: column.name,
          order: column.order,
        },
      })
    )
  );

  return prisma.boardColumn.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });
}

