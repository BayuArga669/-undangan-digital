import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const invitationId = searchParams.get('invitationId');

        if (!invitationId) {
            return NextResponse.json({ error: 'invitationId diperlukan' }, { status: 400 });
        }

        const wishes = await prisma.wish.findMany({
            where: { invitationId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json(wishes);
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { invitationId, guestName, message } = await request.json();

        if (!invitationId || !guestName || !message) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation) {
            return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 });
        }

        const wish = await prisma.wish.create({
            data: {
                invitationId,
                guestName,
                message,
            },
        });

        return NextResponse.json(wish, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
