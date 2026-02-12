import { beforeAll, describe, expect, it, mock } from "bun:test";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import type { Product } from "@/types/product.type";

type ProductViewComponent = (typeof import("@/components/ProductView"))["default"];

let ProductView: ProductViewComponent;

beforeAll(async () => {
    mock.module("next/image", () => ({
        __esModule: true,
        default: ({ alt, ...rest }: { alt?: string }) => {
            return <img alt={alt} {...rest} />;
        },
    }));

    ProductView = (await import("@/components/ProductView")).default;
});

describe("ProductView", () => {
    it("should render nothing when product is null", () => {
        const html = renderToString(
            <ProductView product={null as unknown as Product} inputRef={createRef()} />
        );

        expect(html).toBe("");
    });

    it("should render regular pricing information when there is no promotion", () => {
        const product: Product = {
            articleCode: 1010,
            barCode: 1234567890123,
            description: "Vitaminas A-Z",
            isBlocked: false,
            prices: {
                base: 10,
                tax: 16,
                taxAmount: 1.6,
                priceWithTax: 11.6,
                referencePrice: 3.5,
            },
            promotion: null,
            rate: {
                dollar: 40.5,
                euro: 42,
            },
        };

        const html = renderToString(
            <ProductView product={product} inputRef={createRef()} />
        );

        const sanitizedHtml = html.replace(/<!--.*?-->/g, "");

        expect(sanitizedHtml).toContain("Regular");
        expect(sanitizedHtml).not.toContain("PRECIO REF PROM");
        expect(sanitizedHtml).toContain("1,60 Bs");
        expect(sanitizedHtml).toContain("3,50 $");
    });

    it("should highlight promotion details when available", () => {
        const product: Product = {
            articleCode: 2020,
            barCode: 9876543210123,
            description: "Crema Facial Premium",
            isBlocked: false,
            prices: {
                base: 25,
                tax: 16,
                taxAmount: 4,
                priceWithTax: 29,
                referencePrice: 8,
            },
            promotion: {
                name: "Descuento Especial",
                basePrice: 18,
                priceWithTax: 20,
                referencePrice: 6,
                discountPercentage: 30,
                savings: 9,
                taxAmount: 2,
            },
            rate: {
                dollar: 40.5,
                euro: 42,
            },
        };

        const html = renderToString(
            <ProductView product={product} inputRef={createRef()} />
        );

        const sanitizedHtml = html.replace(/<!--.*?-->/g, "");

        expect(sanitizedHtml).toContain("Descuento Especial");
        expect(sanitizedHtml).toContain("-30%");
        expect(sanitizedHtml).toContain("PRECIO REF PROM");
        expect(sanitizedHtml).toContain("Ahorra");
    });
});
