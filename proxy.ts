import { NextResponse, NextRequest } from "next/server";
import { getIPs } from "./lib/getIPs";

export default function proxy(req: NextRequest) {
    const IPs = getIPs()
    const requestIP = req.headers.get('x-forwarded-for') || '';

    if (!IPs.includes(requestIP)) {
        return NextResponse.json({ error: "Unauthorized IP" }, { status: 401 });
    }
    const auth = req.headers.get('authorization');

    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.split(' ')[1] === process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.next();
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

}

export const config = {
    matcher: '/api/:path*',
};