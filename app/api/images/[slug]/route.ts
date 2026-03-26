import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params;

    try {
        const rootDirectory = process.cwd();
        const folderRelativePath = path.join('storage', 'webp');
        const storagePath = path.join(rootDirectory, folderRelativePath);

        const fileName = slug.split('.')[0];
        const filePath = path.join(storagePath, `${fileName}.webp`);

        if (existsSync(filePath)) {
            const imageBuffer = await fs.readFile(filePath);

            return new NextResponse(imageBuffer, {
                headers: {
                    'Content-Type': 'image/webp',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        return new NextResponse('Imagen no encontrada', { status: 404 });

    } catch (error) {
        console.error('Error en API de imágenes:', error);
        return new NextResponse('Error interno del servidor', { status: 500 });
    }
}