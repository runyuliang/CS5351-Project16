import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, password, role = 'user' } = await req.json();

    // 输入验证
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: '姓名、邮箱和密码为必填项' }), { status: 400 });
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: '该邮箱已被注册' }), { status: 400 });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return new Response(JSON.stringify(userWithoutPassword), { status: 201 });

  } catch (err) {
    return new Response(JSON.stringify({ error: '服务器内部错误' }), { status: 500 });
  }
}