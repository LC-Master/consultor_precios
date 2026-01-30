import { codeSchema } from "@/app/schemas/code.schema";
import { IProduct, productSchema } from "@/app/schemas/product.schema";
import { NextRequest } from "next/server";
import sql from 'mssql';
import { pool } from "@/src/provider/pool.provider";
import { Product } from "@/types/product.type";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const parsedCode = codeSchema.safeParse(code);

    if (!parsedCode.success) {
        return Response.json({ error: "Invalid code parameter" }, { status: 400 });
    }

    try {
        const result = await pool.request()
            .input('sCo_Art', sql.NVarChar, parsedCode.data)
            .execute('[dbo].spConsultaPrecioJson');

        const row = result.recordset[0];
        if (!row) {
            return Response.json({ error: "Product not found" }, { status: 404 });
        }

        const rawValue = Object.values(row)[0];

        const rawData = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;

        const parsedInfo = productSchema.safeParse(rawData);

        if (!parsedInfo.success) {
            console.error("Zod Validation Error:", parsedInfo.error.issues);
            return Response.json({ error: "Invalid product data structure" }, { status: 500 });
        }

        const product = parsedInfo.data as IProduct;


        const hasPromotion = !!(product.NomProm && product.PorcDesc && product.PorcDesc > 0);

        const normalizeProduct = (product: IProduct, hasPromotion: boolean): Product => {
            return {
                isBlocked: product.Bloqueado,
                barCode: product.CodBarra,
                articleCode: product.CodArticulo,
                description: product.Descripcion,
                prices: {
                    base: product.PrecioBase,
                    tax: product.Iva,
                    priceWithTax: product.PrecioIva,
                    referencePrice: product.PrecioRef,
                },
                promotion: hasPromotion ? {
                    name: product.NomProm,
                    basePrice: product.PrecioBaseProm,
                    priceWithTax: product.PrecioIVAProm,
                    referencePrice: product.PrecioRefProm,
                    savings: (product.PrecioIva ?? 0) - (product.PrecioIVAProm ?? 0),
                    discountPercentage: product.PorcDesc,
                } : null,
                rate: {
                    dollar: product.Tasa,
                    euro: product.TasaEuro,
                },
            };
        };

        const resultProcessed = normalizeProduct(product, hasPromotion);

        return Response.json(resultProcessed, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Server Error:", error.message);
        } else {
            console.error("Server Error:", error);
        }
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}