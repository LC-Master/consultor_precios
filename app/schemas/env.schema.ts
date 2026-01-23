import z from "zod";

export const envSchema = z.object(
  {
    URL_CONSULTA_PRECIO: z
      .url({ error: "URL_CONSULTA_PRECIO debe ser una URL válida" })
      .min(1, "URL_CONSULTA_PRECIO no puede estar vacío")
      .nonempty("URL_CONSULTA_PRECIO no puede estar vacío")
      .nonoptional({ error: "URL_CONSULTA_PRECIO es obligatorio" })
      .describe("URL del servicio de consulta de precios"),
    NEXT_PUBLIC_TIMEOUT_SECONDS: z.coerce
      .number({
        error: "NEXT_PUBLIC_TIMEOUT_SECONDS debe ser un número",
      })
      .int({ message: "NEXT_PUBLIC_TIMEOUT_SECONDS debe ser un número entero" })
      .min(1, "NEXT_PUBLIC_TIMEOUT_SECONDS debe ser al menos 1 segundo")
      .max(60, "NEXT_PUBLIC_TIMEOUT_SECONDS no puede ser mayor a 60 segundos")
      .nonoptional({ error: "NEXT_PUBLIC_TIMEOUT_SECONDS es obligatorio" })
      .describe("Tiempo de espera en segundos para las solicitudes del cliente")
      .default(25),
    NEXT_PUBLIC_API_URL_CDS: z
      .url({ error: "NEXT_PUBLIC_API_URL_CDS debe ser una URL válida" })
      .min(1, "NEXT_PUBLIC_API_URL_CDS no puede estar vacío")
      .nonempty("NEXT_PUBLIC_API_URL_CDS no puede estar vacío")
      .nonoptional({ error: "NEXT_PUBLIC_API_URL_CDS es obligatorio" })
      .describe("URL base de la API de CDS"),
    NEXT_PUBLIC_API_KEY_CDS: z
      .jwt({ error: "NEXT_PUBLIC_API_KEY_CDS debe ser un JWT válido" })
      .min(1, "NEXT_PUBLIC_API_KEY_CDS no puede estar vacío")
      .nonempty("NEXT_PUBLIC_API_KEY_CDS no puede estar vacío")
      .nonoptional({ error: "NEXT_PUBLIC_API_KEY_CDS es obligatorio" })
      .describe("Clave API JWT para autenticación con la API de CDS"),
  },
  { error: "Las variables de entorno no cumplen con el esquema definido" },
);
