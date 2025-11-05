import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        // 输入验证
        if (!email || !password) {
            return new Response(JSON.stringify({ error: '邮箱和密码为必填项' }), { status: 400 });
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return new Response(JSON.stringify({ error: '用户不存在' }), { status: 400 });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: '密码错误' }), { status: 400 });
        }

        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        return new Response(JSON.stringify(userWithoutPassword), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: '服务器内部错误' }), { status: 500 });
    }
}