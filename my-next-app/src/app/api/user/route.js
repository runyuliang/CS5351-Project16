import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  const { name, email, role } = await req.json();

  try {
    const user = await prisma.user.create({
      data: { name, email, role },
    });

    return new Response(JSON.stringify(user), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}


async function addTestUser() {
  await prisma.user.create({
    data: {
      name: 'TestUser',
      email: 'testuser@example.com',
      role: 'admin',
    },
  });
}

addTestUser().catch(console.error);
