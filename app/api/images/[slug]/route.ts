import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params;

    try {
        const fs = await import('fs/promises');
        const { existsSync } = await import('fs');
        const path = await import('path');

        const root = process.cwd();
        const folder = ['storage', 'webp'].join(path.sep);
        const fileName = `${slug.split('.')[0]}.webp`;
        const filePath = path.join(root, folder, fileName);

        if (existsSync(filePath)) {
            const imageBuffer = await fs.readFile(filePath);

            return new NextResponse(imageBuffer, {
                headers: {
                    'Content-Type': 'image/webp',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'X-Content-Type-Options': 'nosniff'
                },
            });
        }

        return new NextResponse('Not Found', { status: 404 });
    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}