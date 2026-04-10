import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET() {
    try {
        const baseUrl = (process.env.API_URL_CDS || "").replace(/\/+$/, "");
        const response = await fetch(`${baseUrl}/internal/handshake`, {
            headers: {
                "x-master-key": process.env.MASTER_KEY || "",
            },
            method: "GET",
        });
        if (!response.ok) {
            throw new Error(`Handshake failed with status ${response.status}`);
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        logger.error({message: "Error during handshake",
             error
        });
        return NextResponse.json({ error: "Error during handshake" }, { status: 500 });
    }
}