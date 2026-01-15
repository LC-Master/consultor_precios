import { z } from "zod";
export const checkPricesSchema = z
  .string()
  .min(1)
  .max(25)
  .nonempty()
  .regex(/^[0-9]+$/, {
    message: "El código de barras debe contener solo números",
  });
