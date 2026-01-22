import { z } from "zod";

export const checkPricesSchema = z
  .string({ error: "El código de barras debe ser una cadena de texto" })
  .min(1, "El código de barras no puede estar vacío")
  .max(25, "El código de barras es demasiado largo")
  .nonempty("El código de barras no puede estar vacío")
  .regex(/^\d+$/, "El código de barras debe contener solo números")
  .describe("Código de barras del producto");
