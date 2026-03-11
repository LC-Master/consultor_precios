import { z } from "zod";

export const codeSchema = z
    .string({ error: "Invalid code" })
    .regex(/^\d+$/, "Invalid code")
    .max(16, "Invalid code")
    .describe("Bar code of the product");