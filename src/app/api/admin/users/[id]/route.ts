import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = session.user as { id: string; role: string };
        if (currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const data = await request.json();

        // Prevent admin from demoting themselves
        if (id === currentUser.id && data.role && data.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Tidak bisa mengubah role sendiri' },
                { status: 400 }
            );
        }

        const updateData: { plan?: string; role?: string } = {};
        if (data.plan !== undefined) updateData.plan = data.plan;
        if (data.role !== undefined) updateData.role = data.role;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                createdAt: true,
                _count: {
                    select: { invitations: true },
                },
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('PUT /api/admin/users/[id] error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
