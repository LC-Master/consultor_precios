import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const { slug } = await params;
    const STORAGE_PATH = process.env.IMAGES_PATH || path.join(process.cwd(), 'storage', 'webp');

    const fileName = slug.split('.')[0];
    const filePath = path.join(STORAGE_PATH, `${fileName}.webp`);

    if (existsSync(filePath)) {
        try {
            const imageBuffer = await fs.readFile(filePath);
            return new NextResponse(imageBuffer, {
                headers: {
                    'Content-Type': 'image/webp',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        } catch (error) {
            console.error("Error leyendo archivo:", error);
        }
    }

    try {
        const fallbackPath = path.join(process.cwd(), 'public', 'locatel.webp');
        const fallback = await fs.readFile(fallbackPath);
        return new NextResponse(fallback, {
            headers: { 'Content-Type': 'image/webp' }
        });
    } catch {
        return new NextResponse('Image not found', { status: 404 });
    }
}