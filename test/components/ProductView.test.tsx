import { describe, expect, it, mock } from "bun:test";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import ProductView from "@/components/ProductView";
import type { Product } from "@/types/product.type";

// Mock next/image
mock.module("next/image", () => ({
    __esModule: true,
    default: ({ alt, ...rest }: { alt?: string }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img alt={alt} {...rest} />;
    },
}));

describe("ProductView", () => {
    it("should render nothing when product is null", () => {
        const { container } = render(
            <ProductView product={null as unknown as Product} inputRef={createRef()} />
        );

        expect(container.firstChild).toBeNull();
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

        render(<ProductView product={product} inputRef={createRef()} />);

        expect(screen.getByText("Regular")).toBeDefined();
        expect(screen.queryByText("PRECIO REF PROM")).toBeNull();
        expect(screen.getAllByText("1,60 Bs").length).toBeGreaterThan(0);
        expect(screen.getAllByText("3,50 $").length).toBeGreaterThan(0);
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

        render(<ProductView product={product} inputRef={createRef()} />);

        expect(screen.getByText("Descuento Especial")).toBeDefined();
        expect(screen.getByText("-30%")).toBeDefined();
        expect(screen.getByText("PRECIO REF PROM")).toBeDefined();
        expect(screen.getByText((content) => content.includes("Ahorra"))).toBeDefined();
    });

    it("should handle invalid price values gracefully", () => {
        const product: Product = {
            articleCode: 3030,
            barCode: 1112223334445,
            description: "Producto sin precios",
            isBlocked: false,
            prices: {
                base: 0,
                tax: 16,
                taxAmount: 0,
                priceWithTax: 10,
                referencePrice: NaN,
            },
            promotion: {
                name: "Prom null",
                basePrice: null,
                priceWithTax: null,
                referencePrice: null,
                discountPercentage: null,
                savings: null,
                taxAmount: null,
            },
            rate: {
                dollar: undefined,
                euro: undefined,
            },
        };

        render(<ProductView product={product} inputRef={createRef()} />);

        // Should still render wrapper and not show "null" strings
        expect(screen.getByText("Producto sin precios")).toBeDefined();
        expect(screen.queryByText("null")).toBeNull();
    });
});
