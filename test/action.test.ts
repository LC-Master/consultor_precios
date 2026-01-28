import { describe, expect, it } from "bun:test";
import { checkPrice } from "../app/actions/checkPrice";
import { ActionCheckPriceErrors } from "@/app/Errors/ActionCheckPriceErrors";

describe("Action Tests", () => {
  it("should throw for invalid barcode", async () => {
    return expect(checkPrice("invalid-barcode")).rejects.toThrowError(ActionCheckPriceErrors.INVALID_BARCODE);
  });

  it("should return product data for valid barcode", async () => {
    const result = await checkPrice("7591031101857");
    expect(result).toEqual({
      isBlocked: false,
      barCode: 7591031101857,
      articleCode: 2117612,
      description: "YUKERY NECTAR DE MANZANA PET 5",
      prices: {
        base: 598.81,
        tax: 16,
        priceWithTax: 694.62,
        referencePrice: 1.97,
      },
      promotion: null,
      rate: {
        dollar: 352.71,
        euro: 413.39,
      },
    });
  });

  it("should promotion be null when no promotion data", async () => {
    const result = await checkPrice("7591031101857");
    expect(result?.promotion).toBeNull();
  });

  it("should null when product not found", async () => {
    return expect(checkPrice("0000000000000")).rejects.toThrowError(ActionCheckPriceErrors.PRODUCT_NOT_FOUND);
  });

  it("should accept numeric barcode input", async () => {
    const result = await checkPrice((7591031101857).toString());
    expect(result?.barCode).toBe(7591031101857);
  });

  it("should have consistent priceWithTax calculation", async () => {
    const result = await checkPrice("7591031101857");
    if (!result) throw new Error("Product not found");
    const { base, tax, priceWithTax } = result.prices;
    const expected = parseFloat((base * (1 + tax / 100)).toFixed(2));
    expect(priceWithTax).toBeCloseTo(expected, 2);
  });

  it("should return fields with correct types and positive referencePrice", async () => {
    const result = await checkPrice("7591031101857");
    expect(result).toEqual(
      expect.objectContaining({
        isBlocked: expect.any(Boolean),
        barCode: expect.any(Number),
        articleCode: expect.any(Number),
        description: expect.any(String),
        prices: expect.objectContaining({
          base: expect.any(Number),
          tax: expect.any(Number),
          priceWithTax: expect.any(Number),
          referencePrice: expect.any(Number),
        }),
        rate: expect.objectContaining({
          dollar: expect.any(Number),
          euro: expect.any(Number),
        }),
      })
    );
    expect(result?.prices.referencePrice).toBeGreaterThan(0);
  });
});
