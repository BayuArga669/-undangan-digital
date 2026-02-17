import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as { id: string }).id },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                plan: true,
                createdAt: true,
                _count: { select: { invitations: true } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...user,
            createdAt: user.createdAt.toISOString(),
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const body = await request.json();
        const { name, email, currentPassword, newPassword, profileImage } = body;

        // If only updating profileImage, allow without name/email
        const isPhotoOnlyUpdate = profileImage !== undefined && !name && !email && !currentPassword && !newPassword;

        if (!isPhotoOnlyUpdate && (!name || !email)) {
            return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
        }

        // If only updating profile image
        if (isPhotoOnlyUpdate) {
            await prisma.user.update({
                where: { id: userId },
                data: { profileImage },
            });
            return NextResponse.json({ message: 'Foto profil berhasil diperbarui' });
        }

        // Check if email is taken by another user
        if (email !== session.user.email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing && existing.id !== userId) {
                return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
            }
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Password saat ini wajib diisi' }, { status: 400 });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
            }

            if (newPassword.length < 6) {
                return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: userId },
                data: { name, email, password: hashedPassword, ...(profileImage !== undefined && { profileImage }) },
            });
        } else {
            await prisma.user.update({
                where: { id: userId },
                data: { name, email, ...(profileImage !== undefined && { profileImage }) },
            });
        }

        return NextResponse.json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
