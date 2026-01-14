import { z } from "zod";

export const checkPricesSchema = z.object({
  code: z
    .string()
    .min(1, "El código no puede estar vacío")
    .length(13, "El código debe tener 13 dígitos")
    .nonempty("El código no puede estar vacío")
    .regex(/^\d+$/, "El código debe contener solo números"),
});
export type CheckPriceSchema = z.infer<typeof checkPricesSchema>;
