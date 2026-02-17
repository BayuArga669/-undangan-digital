import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import InvitationView from '@/components/InvitationView';

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ to?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({ where: { slug } });

    if (!invitation) return { title: 'Undangan Tidak Ditemukan' };

    return {
        title: `Undangan ${invitation.groomName} & ${invitation.brideName}`,
        description: `Anda diundang ke pernikahan ${invitation.groomName} & ${invitation.brideName}`,
        openGraph: {
            title: `Undangan Pernikahan ${invitation.groomName} & ${invitation.brideName}`,
            description: `Kami mengundang Anda untuk hadir di acara pernikahan kami.`,
        },
    };
}

export default async function InvitationPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { to } = await searchParams;

    const invitation = await prisma.invitation.findUnique({
        where: { slug },
        include: {
            wishes: { orderBy: { createdAt: 'desc' }, take: 50 },
            user: { select: { plan: true } },
        },
    });

    if (!invitation || !invitation.isPublished) {
        notFound();
    }

    // Increment view count
    await prisma.invitation.update({
        where: { id: invitation.id },
        data: { viewCount: { increment: 1 } },
    });

    // Serialize dates for client component
    const serializedInvitation = {
        ...invitation,
        eventDate: invitation.eventDate?.toISOString() || null,
        akadDate: invitation.akadDate?.toISOString() || null,
        createdAt: invitation.createdAt.toISOString(),
        updatedAt: invitation.updatedAt.toISOString(),
        wishes: invitation.wishes.map((w) => ({
            ...w,
            createdAt: w.createdAt.toISOString(),
        })),
    };

    return <InvitationView invitation={serializedInvitation} guestName={to || ''} isFreePlan={invitation.user.plan === 'FREE'} />;
}
