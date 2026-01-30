import { codeSchema } from "@/app/schemas/code.schema";
import { IProduct, productSchema } from "@/app/schemas/product.schema";
import { NextRequest,NextResponse } from "next/server";
import sql from 'mssql';
import { pool } from "@/src/provider/pool.provider";
import { normalizeProduct } from "@/lib/normalizeProduct";

export async function GET(request: NextRequest) {
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
            console.error("Zod Validation Error:", parsedInfo.error.issues);
            return NextResponse.json({ error: "Invalid product data structure" }, { status: 500 });
        }

        const product = parsedInfo.data as IProduct;

        const resultProcessed = normalizeProduct(product);

        return NextResponse.json(resultProcessed, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Server Error:", error.message);
        } else {
            console.error("Server Error:", error);
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}