import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const invitations = await prisma.invitation.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        guests: true,
                        wishes: true,
                    },
                },
                guests: {
                    where: { rsvpStatus: 'ATTENDING' },
                    select: { id: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(invitations);
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const data = await request.json();

        // Generate slug
        let slug = data.slug || `${data.groomName}-${data.brideName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // Check slug uniqueness
        const existingSlug = await prisma.invitation.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        const invitation = await prisma.invitation.create({
            data: {
                userId,
                slug,
                templateId: data.templateId || 'elegant-rose',
                groomName: data.groomName || '',
                brideName: data.brideName || '',
                groomPhoto: data.groomPhoto || '',
                bridePhoto: data.bridePhoto || '',
                coverPhoto: data.coverPhoto || '',
                groomFather: data.groomFather || '',
                groomMother: data.groomMother || '',
                brideFather: data.brideFather || '',
                brideMother: data.brideMother || '',
                eventDate: data.eventDate ? new Date(data.eventDate) : null,
                akadDate: data.akadDate ? new Date(data.akadDate) : null,
                akadTime: data.akadTime || '',
                receptionTime: data.receptionTime || '',
                venue: data.venue || '',
                venueAddress: data.venueAddress || '',
                lat: data.lat ? parseFloat(data.lat) : null,
                lng: data.lng ? parseFloat(data.lng) : null,
                story: data.story || '',
                galleryPhotos: data.galleryPhotos || '[]',
                musicUrl: data.musicUrl || '',
                bankName: data.bankName || '',
                bankAccount: data.bankAccount || '',
                bankHolder: data.bankHolder || '',
                qrisImage: data.qrisImage || '',
                isPublished: data.isPublished || false,
            },
        });

        return NextResponse.json(invitation, { status: 201 });
    } catch (error) {
        console.error('POST /api/invitations error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Server error', details: message }, { status: 500 });
    }
}
