import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin123';
    const adminName = 'Administrator';

    const existing = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existing) {
        // Update to admin if not already
        if (existing.role !== 'ADMIN') {
            await prisma.user.update({
                where: { email: adminEmail },
                data: { role: 'ADMIN' },
            });
            console.log(`✅ User "${adminEmail}" upgraded to ADMIN`);
        } else {
            console.log(`ℹ️  Admin "${adminEmail}" already exists`);
        }
    } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
    }
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
