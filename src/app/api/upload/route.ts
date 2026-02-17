import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    console.log('=== Upload request started ===');
    
    try {
        console.log('Cloudinary config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'missing',
            api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'missing',
        });

        console.log('Parsing form data...');
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'File diperlukan' }, { status: 400 });
        }

        console.log('File info:', { name: file.name, size: file.size, type: file.type });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('Buffer size:', buffer.length);
        console.log('Converting to base64...');

        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        console.log('Starting Cloudinary upload...');

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: 'undangan-digital',
            resource_type: 'auto',
        });

        console.log('Upload successful:', uploadResult.secure_url);

        return NextResponse.json({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            filename: file.name,
        });
    } catch (error) {
        console.error('=== Upload error ===');
        console.error('Error details:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json({ error: 'Upload gagal' }, { status: 500 });
    }
}
