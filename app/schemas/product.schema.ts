import { z } from 'zod'

export const productSchema = z.object({
    CodArticulo: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number({ error: "Invalid CodArticulo" })
            .int({ error: "CodArticulo must be an integer" })
            .nonnegative({ error: "CodArticulo must be non-negative" })
        )
        .describe("Article code of the product"),
    CodBarra: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') return Number(val.trim());
            return val;
        })
        .pipe(
            z.number({ error: "Invalid CodBarra" })
            .nonnegative({ error: "CodBarra must be non-negative" })
        )
        .describe("Barcode of the product"),
    Bloqueado: z
        .boolean({ error: "Invalid Bloqueado" })
        .describe("Indicates if the product is blocked"),
    Descripcion: z
        .string({ error: "Invalid Descripcion" })
        .min(1, { message: "Descripcion cannot be empty" })
        .describe("Description of the product"),
    PrecioBase: z
        .number({ error: "Invalid PrecioBase" })
        .nonnegative({ error: "PrecioBase must be non-negative" })
        .describe("Base price of the product"),
    PctIva: z
        .number({ error: "Invalid PctIva" })
        .nonnegative({ error: "PctIva must be non-negative" })
        .nonoptional()
        .describe("Tax percentage applied to the product"),
    MontoIva: z
        .number({ error: "Invalid MontoIva" })
        .nonnegative({ error: "MontoIva must be non-negative" })
        .optional()
        .nullable()
        .describe("Tax amount applied to the product"),
    PrecioIva: z
        .number({ error: "Invalid PrecioIva" })
        .nonnegative({ error: "PrecioIva must be non-negative" })
        .nonoptional()
        .describe("Price including tax"),
    PrecioRef: z
        .number({ error: "Invalid PrecioRef" })
        .nonnegative({ error: "PrecioRef must be non-negative" })
        .describe("Reference price"),
    Tasa: z
        .number({ error: "Invalid Tasa" })
        .nonnegative({ error: "Tasa must be non-negative" })
        .describe("Dollar exchange rate"),
    TasaEuro: z
        .number({ error: "Invalid TasaEuro" })
        .nonnegative({ error: "TasaEuro must be non-negative" })
        .describe("Euro exchange rate"),
    NomProm: z
        .string({ error: "Invalid NomProm" })
        .nullable()
        .optional()
        .describe("Name of the promotion"),
    PrecioBaseProm: z
        .number({ error: "Invalid PrecioBaseProm" })
        .nonnegative({ error: "PrecioBaseProm must be non-negative" })
        .nullable()
        .optional()
        .describe("Base price of the promotion"),
    MontoIvaProm: z
        .number({ error: "Invalid MontoIvaProm" })
        .nonnegative({ error: "MontoIvaProm must be non-negative" })
        .nullable()
        .optional()
        .describe("Tax amount for promotion"),
    PrecioIVAProm: z
        .number({ error: "Invalid PrecioIVAProm" })
        .nonnegative({ error: "PrecioIVAProm must be non-negative" })
        .nullable()
        .optional()
        .describe("Base price of the promotion"),
    PrecioRefProm: z
        .number({ error: "Invalid PrecioRefProm" })
        .nonnegative({ error: "PrecioRefProm must be non-negative" })
        .nullable()
        .optional()
        .describe("Base price of the promotion"),
    PorcDesc: z
        .number({ error: "Invalid PorcDesc" })
        .nonnegative({ error: "PorcDesc must be non-negative" })
        .nullable()
        .optional()
        .describe("Base price of the promotion")
}, {
    error: "Invalid product object"
}).describe("Product price information");


export type IProduct = z.infer<typeof productSchema>;