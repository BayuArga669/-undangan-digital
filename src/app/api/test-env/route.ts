import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing',
        database_url: process.env.DATABASE_URL ? 'set' : 'missing',
        direct_url: process.env.DIRECT_URL ? 'set' : 'missing',
    });
}
