import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
    const auth = request.headers.get('authorization');

    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.split(' ')[1] === process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.next();
    } 

    return Response.json({ error: "Forbidden" }, { status: 403 });

}

export const config = {
    matcher: '/api/:path*',
};