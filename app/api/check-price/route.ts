import { codeSchema } from "@/app/schemas/code.schema";
import { IProduct, productSchema } from "@/app/schemas/product.schema";
import { NextRequest, NextResponse } from "next/server";
import sql from 'mssql';
import { pool } from "@/src/provider/pool.provider";
import { normalizeProduct } from "@/lib/normalizeProduct";
import { logger } from "@/lib/logger";
import isRateLimited from "@/lib/rateLimit";

const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const firstIp = forwardedFor.split(",")[0]?.trim();
        if (firstIp) {
            return firstIp;
        }
    }

    return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(request: NextRequest) {
    const clientIp = getClientIp(request);

    if (isRateLimited(clientIp, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
                },
            },
        );
    }

    const code = request.nextUrl.searchParams.get("code");
    const parsedCode = codeSchema.safeParse(code);
    if (!parsedCode.success) {
        return NextResponse.json({ error: "Invalid code parameter" }, { status: 400 });
    }

    try {
        const result = await pool.request()
            .input('sCo_Art', sql.NVarChar, parsedCode.data)
            .execute('[dbo].spConsultaPrecioJson');
        const row = result.recordset[0];
        if (!row) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const rawValue = Object.values(row)[0];

        const rawData = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;

        const parsedInfo = productSchema.safeParse(rawData);

        if (!parsedInfo.success) {
            logger.error({ message: "Zod Validation Error", errors: parsedInfo.error.issues });
            return NextResponse.json({ error: "Invalid product data structure" }, { status: 500 });
        }

        const product = parsedInfo.data as IProduct;

        const resultProcessed = await normalizeProduct(product);

        return NextResponse.json(resultProcessed, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error({ message: "Server Error", error: error.message });
        } else {
            logger.error({ message: "Server Error", error });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}