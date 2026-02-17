import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { invitationId, name, rsvpStatus, rsvpCount } = await request.json();

        if (!invitationId || !name) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        // Check if invitation exists
        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation) {
            return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 });
        }

        // Check if guest already responded  
        const existingGuest = await prisma.guest.findFirst({
            where: {
                invitationId,
                name: { equals: name },
            },
        });

        if (existingGuest) {
            // Update existing RSVP
            const updated = await prisma.guest.update({
                where: { id: existingGuest.id },
                data: {
                    rsvpStatus: rsvpStatus || 'ATTENDING',
                    rsvpCount: rsvpCount || 1,
                },
            });
            return NextResponse.json(updated);
        }

        const guest = await prisma.guest.create({
            data: {
                invitationId,
                name,
                rsvpStatus: rsvpStatus || 'ATTENDING',
                rsvpCount: rsvpCount || 1,
            },
        });

        return NextResponse.json(guest, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
