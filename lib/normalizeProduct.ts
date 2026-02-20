import { IProduct } from "@/app/schemas/product.schema";
import { Product } from "@/types/product.type";

/**
 * The `normalizeProduct` function in TypeScript normalizes product data and includes promotion details
 * if available.
 * @param {IProduct} product - The `normalizeProduct` function takes an object of type `IProduct` as
 * input and returns an object of type `Product` with normalized properties.
 * @returns The `normalizeProduct` function is returning a normalized product object based on the input
 * `product` object. The returned object includes various properties such as `isBlocked`, `barCode`,
 * `articleCode`, `description`, `prices`, `promotion`, and `rate`. The `promotion` property is
 * conditionally included based on whether the input product has a promotion.
 */
export const normalizeProduct = (product: IProduct): Product => {
    const hasPromotion = !!(product.NomProm && product.PorcDesc && product.PorcDesc > 0);
    return {
        isBlocked: product.Bloqueado,
        barCode: product.CodBarra,
        articleCode: product.CodArticulo,
        description: product.Descripcion,
        prices: {
            base: product.PrecioBase,
            tax: product.PctIva,
            taxAmount: product.MontoIva,
            priceWithTax: product.PrecioIva,
            referencePrice: product.PrecioRef,
        },
        promotion: hasPromotion ? {
            name: product.NomProm,
            basePrice: product.PrecioBaseProm,
            taxAmount: product.MontoIvaProm,
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