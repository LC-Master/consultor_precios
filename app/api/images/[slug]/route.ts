import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// Función para evitar que Turbopack rastree la carpeta durante el build, a bueno ps
function getImagePath(slug: string) {
    const root = process.cwd();
    const p1 = 'stor';
    const p2 = 'age';
    const p3 = 'we';
    const p4 = 'bp';
    return path.join(root, p1 + p2, p3 + p4, `${slug.split('.')[0]}.webp`);
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params;

    try {
        const filePath = getImagePath(slug);

        if (existsSync(filePath)) {
            const imageBuffer = await fs.readFile(filePath);

            return new NextResponse(imageBuffer, {
                headers: {
                    'Content-Type': 'image/webp',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        return new NextResponse('Not Found', { status: 404 });
    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}