import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = (session.user as { id: string }).id;

        const invitation = await prisma.invitation.findFirst({
            where: { id, userId },
            include: {
                guests: { orderBy: { createdAt: 'desc' } },
                wishes: { orderBy: { createdAt: 'desc' } },
                _count: {
                    select: { guests: true, wishes: true },
                },
            },
        });

        if (!invitation) {
            return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json(invitation);
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = (session.user as { id: string }).id;
        const data = await request.json();

        // Verify ownership
        const existing = await prisma.invitation.findFirst({ where: { id, userId } });
        if (!existing) {
            return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
        }

        const invitation = await prisma.invitation.update({
            where: { id },
            data: {
                templateId: data.templateId,
                groomName: data.groomName,
                brideName: data.brideName,
                groomPhoto: data.groomPhoto,
                bridePhoto: data.bridePhoto,
                coverPhoto: data.coverPhoto,
                groomFather: data.groomFather,
                groomMother: data.groomMother,
                brideFather: data.brideFather,
                brideMother: data.brideMother,
                eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
                akadDate: data.akadDate ? new Date(data.akadDate) : undefined,
                akadTime: data.akadTime,
                receptionTime: data.receptionTime,
                venue: data.venue,
                venueAddress: data.venueAddress,
                lat: data.lat ? parseFloat(data.lat) : undefined,
                lng: data.lng ? parseFloat(data.lng) : undefined,
                story: data.story,
                galleryPhotos: data.galleryPhotos,
                musicUrl: data.musicUrl,
                bankName: data.bankName,
                bankAccount: data.bankAccount,
                bankHolder: data.bankHolder,
                qrisImage: data.qrisImage,
                isPublished: data.isPublished,
            },
        });

        return NextResponse.json(invitation);
    } catch (error) {
        console.error('PUT /api/invitations/[id] error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = (session.user as { id: string }).id;

        const existing = await prisma.invitation.findFirst({ where: { id, userId } });
        if (!existing) {
            return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
        }

        await prisma.invitation.delete({ where: { id } });

        return NextResponse.json({ message: 'Berhasil dihapus' });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
