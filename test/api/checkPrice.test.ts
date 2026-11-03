import { describe, it, beforeAll, spyOn, expect } from "bun:test"
import { GET } from "../../app/api/check-price/route";
import { NextRequest } from "next/server";
import { db } from "@/src/provider/db";

const JSON_COLUMN_NAME = "JSON_F52E2B61-18A1-11d1-B105-00805F49916B";
const baseProductPayload = {
    CodArticulo: "2103931",
    CodBarra: "7591440409094                 ",
    Bloqueado: false,
    Descripcion: "ELEMENTAL CREMA CORP TE VER PE",
    PrecioBase: 2236.51,
    PctIva: 16,
    MontoIva: 357.84,
    PrecioIva: 2594.35,
    PrecioRef: 7.13,
    Tasa: 363.66,
    TasaEuro: 434.43,
    NomProm: "Descuento 30%",
    PrecioBaseProm: 1565.56,
    MontoIvaProm: 250.49,
    PrecioIVAProm: 1816.05,
    PrecioRefProm: 4.99,
    FechaValor: "19/03/2026",
    PorcDesc: 30,
};

function mockProductRecord(overrides: Record<string, unknown> = {}) {
    spyOn(db, "execute").mockImplementation(async () => ({
        recordset: [
            {
                [JSON_COLUMN_NAME]: JSON.stringify({
                    ...baseProductPayload,
                    ...overrides,
                }),
            },
        ],
        recordsets: [],
        rowsAffected: [],
        output: {},
        returnValue: 0,
    } as any));
}

describe("checkPrice API validations tests", () => {
    it("should return 400 for missing code parameter", async () => {
        const request = new NextRequest("http://localhost/api/check-price");
        const resp = await GET(request)
        const data = await resp.json()
        expect(resp.status).toEqual(400)
        expect(data).toEqual({ error: "Invalid code parameter" });
    });
    it("should return 400 for invalid code parameter", async () => {
        const request = new NextRequest("http://localhost/api/check-price?code=invalid_code");
        const response = await GET(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data).toEqual({ error: "Invalid code parameter" });
    });
    it("should return 404 for non-existent product", async () => {
        spyOn(db, "execute").mockImplementation(async () => ({
            recordset: [],
            recordsets: [],
            rowsAffected: [],
            output: {},
            returnValue: 0,
        } as any));
        const request = new NextRequest("http://localhost/api/check-price?code=2103931");
        const response = await GET(request);
        const data = await response.json();
        expect(response.status).toBe(404);
        expect(data).toEqual({ error: "Product not found" });
    });
    it("should return 200 with valid product data", async () => {
        mockProductRecord();
        const request = new NextRequest("http://localhost/api/check-price?code=7591440409094");
        const response = await GET(request);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data).toMatchObject({
            articleCode: 2103931,
            barCode: 7591440409094,
            description: "ELEMENTAL CREMA CORP TE VER PE",
            isBlocked: false,
            prices: {
                base: 2236.51,
                priceWithTax: 2594.35,
                referencePrice: 7.13,
                tax: 16,
                taxAmount: 357.84,
            },
            rate: {
                dollar: 363.66,
                euro: 434.43,
            },
        });
        expect(data.promotion).toMatchObject({
            basePrice: 1565.56,
            discountPercentage: 30,
            name: "Descuento 30%",
            priceWithTax: 1816.05,
            referencePrice: 4.99,
            savings: 778.3,
            taxAmount: 250.49,
        });
        expect(data.promotion?.dolarSavings).toBeCloseTo(2.14, 2);
    });

    it("should return 500 when product schema validation fails", async () => {
        mockProductRecord({ CodArticulo: "invalid", Descripcion: "" });
        const request = new NextRequest("http://localhost/api/check-price?code=7591440409094");
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Invalid product data structure" });
    });

    it("should return 503 when database is unavailable", async () => {
        spyOn(db, "execute").mockImplementation(async () => {
            throw new Error("DATABASE_UNAVAILABLE");
        });

        const request = new NextRequest("http://localhost/api/check-price?code=7591440409094");
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data).toEqual({
            error: "DATABASE_UNAVAILABLE",
            message: "Servicio no disponible temporalmente. Intente de nuevo en breve."
        });
    });

    it("should return 500 on server errors", async () => {
        spyOn(db, "execute").mockImplementation(async () => {
            throw new Error("db down");
        });

        const request = new NextRequest("http://localhost/api/check-price?code=7591440409094");
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Internal Server Error" });
    });

    it("should return 429 when IP exceeds request threshold", async () => {
        mockProductRecord();
        const headers = new Headers({ "x-forwarded-for": "198.51.100.10" });
        let lastAllowedResponse = null;

        for (let i = 0; i < 30; i += 1) {
            lastAllowedResponse = await GET(new NextRequest("http://localhost/api/check-price?code=7591440409094", { headers }));
        }

        const limitedResponse = await GET(new NextRequest("http://localhost/api/check-price?code=7591440409094", { headers }));
        const limitedData = await limitedResponse.json();

        expect(lastAllowedResponse?.status).toBe(200);
        expect(limitedResponse.status).toBe(429);
        expect(limitedData).toEqual({ error: "Too many requests. Please try again later." });
        expect(limitedResponse.headers.get("Retry-After")).toBe("60");
    });
    describe("checkPrice API with promotion", () => {

        beforeAll(() => {
            mockProductRecord();
        });

        it("should return 200 and promotion data if product has promotion", async () => {
            const request = new NextRequest("http://localhost/api/check-price?code=7591440409094");
            const response = await GET(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.promotion).toBeDefined();
            expect(data.promotion).toMatchObject({
                basePrice: 1565.56,
                discountPercentage: 30,
                name: "Descuento 30%",
                priceWithTax: 1816.05,
                referencePrice: 4.99,
                savings: 778.3,
                taxAmount: 250.49,
            });
            expect(data.promotion?.dolarSavings).toBeCloseTo(2.14, 2);
        });
    })


    describe("checkPrice API without promotion", () => {
        beforeAll(() => {
            mockProductRecord({
                CodArticulo: "2103932",
                CodBarra: "7591440409095                 ",
                NomProm: null,
                PorcDesc: 0,
                PrecioBaseProm: null,
                MontoIvaProm: null,
                PrecioIVAProm: null,
                PrecioRefProm: null,
            });
        });

        it("should return 200 and no promotion data if product has no promotion", async () => {
            const request = new NextRequest("http://localhost/api/check-price?code=7591440409095");
            const response = await GET(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.promotion).toBeNull();
            expect(data).toMatchObject({
                articleCode: 2103932,
                barCode: 7591440409095,
                description: "ELEMENTAL CREMA CORP TE VER PE",
                isBlocked: false,
                prices: {
                    base: 2236.51,
                    priceWithTax: 2594.35,
                    referencePrice: 7.13,
                    tax: 16,
                    taxAmount: 357.84,
                },
                rate: {
                    dollar: 363.66,
                    euro: 434.43,
                },
            });
        });
    })

    spyOn(global, "fetch").mockImplementation((async (url: string) => {
        const requestUrl = String(url);
        if (requestUrl.includes("https://www.locatel.com.ve/api/catalog_system/pub/products/search")) {
            return {
                ok: true,
                json: async () => [{
                    items: [{
                        images: [{
                            imageUrl: "/locatel.webp",
                        }],
                    }],
                }],
            } as Response;
        }
        throw new Error("Unexpected fetch call: " + requestUrl);
    }) as unknown as typeof fetch);
})
