import { describe, it, beforeAll, spyOn, expect } from "bun:test"
import { GET } from "../../app/api/check-price/route";
import { NextRequest } from "next/server";
import { pool } from "@/src/provider/pool.provider";

describe("checkPrice API validations tests", () => {
    it("should return 400 for missing code parameter", async () => {
        const request = new NextRequest("http://localhost/api/check-price");
        const resp = await GET(request)
        const data = await resp.json()
        expect(resp.status).toEqual(400)
        expect(data).toEqual({ error: "Invalid code parameter" });
    });
    it("should return 400 for invalid code parameter", async () => {
        spyOn(pool, "request").mockReturnValue({
            input: () => ({
                execute: async () => ({
                    recordset: [
                        {
                            'JSON_F52E2B61-18A1-11d1-B105-00805F49916B': '{"CodArticulo":"2103931","CodBarra":"7591440409094                 ","Bloqueado":false,"Descripcion":"ELEMENTAL CREMA CORP TE VER PE","PrecioBase":2236.5100,"Iva":1.6000000e+001,"PrecioIva":2.594350000000000e+003,"PrecioRef":7.130000000000000e+000,"Tasa":3.636600000000000e+002,"TasaEuro":4.344300000000000e+002,"NomProm":"Descuento 30%","PrecioBaseProm":1.565560000000000e+003,"PrecioIVAProm":1.816050000000000e+003,"PrecioRefProm":4.990000000000000e+000,"PorcDesc":3.000000000000000e+001}'
                        }
                    ],
                    recordsets: [],
                    rowsAffected: [],
                    output: {},
                    returnValue: 0,
                })
            })
        } as unknown as ReturnType<typeof pool.request>);
        const request = new NextRequest("http://localhost/api/check-price?code=invalid_code");
        const response = await GET(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data).toEqual({ error: "Invalid code parameter" });
    });
    it("should return 404 for non-existent product", async () => {
        spyOn(pool, "request").mockReturnValue({
            input: () => ({
                execute: async () => ({
                    recordset: [],
                    recordsets: [],
                    rowsAffected: [],
                    output: {},
                    returnValue: 0,
                })
            })
        } as unknown as ReturnType<typeof pool.request>);
        const request = new NextRequest("http://localhost/api/check-price?code=2103931");
        const response = await GET(request);
        const data = await response.json();
        expect(response.status).toBe(404);
        expect(data).toEqual({ error: "Product not found" });
    });
    it("should return 200 with valid product data", async () => {
        spyOn(pool, "request").mockReturnValue({
            input: () => ({
                execute: async () => ({
                    recordset: [
                        {
                            'JSON_F52E2B61-18A1-11d1-B105-00805F49916B': '{"CodArticulo":"2103931","CodBarra":"7591440409094                 ","Bloqueado":false,"Descripcion":"ELEMENTAL CREMA CORP TE VER PE","PrecioBase":2236.5100,"Iva":1.6000000e+001,"PrecioIva":2.594350000000000e+003,"PrecioRef":7.130000000000000e+000,"Tasa":3.636600000000000e+002,"TasaEuro":4.344300000000000e+002,"NomProm":"Descuento 30%","PrecioBaseProm":1.565560000000000e+003,"PrecioIVAProm":1.816050000000000e+003,"PrecioRefProm":4.990000000000000e+000,"PorcDesc":3.000000000000000e+001}'
                        }
                    ],
                    recordsets: [],
                    rowsAffected: [],
                    output: {},
                    returnValue: 0,
                })
            })
        } as unknown as ReturnType<typeof pool.request>);
        const request = new NextRequest("http://localhost/api/check-price?code=7591440409094");
        const response = await GET(request);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data).toEqual({
            articleCode: 2103931,
            barCode: 7591440409094,
            description: "ELEMENTAL CREMA CORP TE VER PE",
            isBlocked: false,
            prices: {
                base: 2236.51,
                priceWithTax: 2594.35,
                referencePrice: 7.13,
                tax: 16,
            },
            promotion: {
                basePrice: 1565.56,
                discountPercentage: 30,
                name: "Descuento 30%",
                priceWithTax: 1816.05,
                referencePrice: 4.99,
                savings: 778.3,
            },
            rate: {
                dollar: 363.66,
                euro: 434.43,
            },
        });
    });
    describe("checkPrice API with promotion", () => {

        beforeAll(() => {
            spyOn(pool, "request").mockReturnValue({
                input: () => ({
                    execute: async () => ({
                        recordset: [
                            {
                                'JSON_F52E2B61-18A1-11d1-B105-00805F49916B': '{"CodArticulo":"2103931","CodBarra":"7591440409094                 ","Bloqueado":false,"Descripcion":"ELEMENTAL CREMA CORP TE VER PE","PrecioBase":2236.5100,"Iva":1.6000000e+001,"PrecioIva":2.594350000000000e+003,"PrecioRef":7.130000000000000e+000,"Tasa":3.636600000000000e+002,"TasaEuro":4.344300000000000e+002,"NomProm":"Descuento 30%","PrecioBaseProm":1.565560000000000e+003,"PrecioIVAProm":1.816050000000000e+003,"PrecioRefProm":4.990000000000000e+000,"PorcDesc":3.000000000000000e+001}'
                            }
                        ],
                        recordsets: [],
                        rowsAffected: [],
                        output: {},
                        returnValue: 0,
                    })
                })
            } as unknown as ReturnType<typeof pool.request>);
        });

        it("should return 200 and promotion data if product has promotion", async () => {
            const request = new NextRequest("http://localhost/api/check-price?code=7591440409094");
            const response = await GET(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.promotion).toBeDefined();
            expect(data.promotion).toEqual({
                basePrice: 1565.56,
                discountPercentage: 30,
                name: "Descuento 30%",
                priceWithTax: 1816.05,
                referencePrice: 4.99,
                savings: 778.3,
            });
        });
    })


    describe("checkPrice API without promotion", () => {
        beforeAll(() => {
            spyOn(pool, "request").mockReturnValue({
                input: () => ({
                    execute: async () => ({
                        recordset: [
                            {
                                'JSON_F52E2B61-18A1-11d1-B105-00805F49916B': '{"CodArticulo":"2103932","CodBarra":"7591440409095                 ","Bloqueado":false,"Descripcion":"ELEMENTAL CREMA CORP TE VER PE","PrecioBase":2236.5100,"Iva":1.6000000e+001,"PrecioIva":2.594350000000000e+003,"PrecioRef":7.130000000000000e+000,"Tasa":3.636600000000000e+002,"TasaEuro":4.344300000000000e+002}'
                            }
                        ],
                        recordsets: [],
                        rowsAffected: [],
                        output: {},
                        returnValue: 0,
                    })
                })
            } as unknown as ReturnType<typeof pool.request>);
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
                },
                rate: {
                    dollar: 363.66,
                    euro: 434.43,
                },
            });
        });
    })

})