import { z } from 'zod'

export const productSchema = z.object({
    CodArticulo: z
        .string({ error: "Invalid CodArticulo" })
        .describe("Article code of the product"),
    CodBarra: z
        .string({ error: "Invalid CodBarra" })
        .describe("Barcode of the product"),
    Bloqueado: z
        .boolean({ error: "Invalid Bloqueado" })
        .describe("Indicates if the product is blocked"),
    Descripcion: z
        .string({ error: "Invalid Descripcion" })
        .describe("Description of the product"),
    PrecioBase: z.
        number({ error: "Invalid PrecioBase" })
        .describe("Base price of the product"),
    Iva: z.
        number({ error: "Invalid Iva" })
        .describe("Tax applied to the product"),
    PrecioIva: z.
        number({ error: "Invalid PrecioIva" })
        .describe("Price including tax"),
    PrecioRef: z.
        number({ error: "Invalid PrecioRef" })
        .describe("Reference price"),
    Tasa: z.
        number({ error: "Invalid Tasa" })
        .describe("Dollar exchange rate"),
    TasaEuro: z.
        number({ error: "Invalid TasaEuro" })
        .describe("Euro exchange rate"),
    NomProm: z
        .string({ error: "Invalid NomProm" })
        .nullable()
        .optional()
        .describe("Name of the promotion"),
    PrecioBaseProm: z.
        number({ error: "Invalid PrecioBaseProm" })
        .nullable()
        .optional()
        .describe("Base price of the promotion"),
    PrecioIVAProm: z.
        number({ error: "Invalid PrecioIVAProm" })
        .nullable()
        .optional()
        .describe("Base price of the promotion"),
    PrecioRefProm: z.
        number({ error: "Invalid PrecioRefProm" })
        .nullable()
        .optional()
        .describe("Base price of the promotion"),
    PorcDesc: z.
        number({ error: "Invalid PorcDesc" })
        .nullable()
        .optional()
        .describe("Base price of the promotion")
}, {
    error: "Invalid product object"
}).describe("Product price information");


export type IProduct = z.infer<typeof productSchema>;