import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params;

    try {
        const fs = require('fs');
        const path = require('path');
        const fsPromises = require('fs').promises;
        const getRoot = () => process.cwd();
        const storageFolder = ['storage', 'webp'].join(path.sep);
        const fileName = `${slug.split('.')[0]}.webp`;

        const filePath = [getRoot(), storageFolder, fileName].join(path.sep);

        if (fs.existsSync(filePath)) {
            const imageBuffer = await fsPromises.readFile(filePath);

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