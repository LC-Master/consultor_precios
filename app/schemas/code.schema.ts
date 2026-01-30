import { z } from "zod";

export const codeSchema = z.coerce
    .number({ error: "Invalid code" })
    .int({ error: "Invalid code" })
    .nonnegative({ error: "Invalid code" })
    .min(1, "Invalid code")
    .transform((val) => val.toString())
    .describe("Bar code of the product");
