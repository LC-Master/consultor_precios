import { StringValue } from "ms";
import z from "zod";

export const envSchema = z.object(
  {
    API_URL_CDS_FRONT: z
      .url({ error: "API_URL_CDS_FRONT debe ser una URL válida" })
      .min(1, "API_URL_CDS_FRONT no puede estar vacío"),
    TIMEOUT_SECONDS: z.coerce
      .number({
        error: "TIMEOUT_SECONDS debe ser un número",
      })
      .int({ message: "TIMEOUT_SECONDS debe ser un número entero" })
      .min(1, "TIMEOUT_SECONDS debe ser al menos 1 segundo")
      .max(60, "TIMEOUT_SECONDS no puede ser mayor a 60 segundos")
      .nonoptional({ error: "TIMEOUT_SECONDS es obligatorio" })
      .describe("Tiempo de espera en segundos para las solicitudes del cliente")
      .default(25),
    TIME_ROTATE_IMAGE_S: z.coerce
      .number({
        error: "TIME_ROTATE_IMAGE_S debe ser un número",
      })
      .int({ message: "TIME_ROTATE_IMAGE_S debe ser un número entero" })
      .min(1, "TIME_ROTATE_IMAGE_S debe ser al menos 1 segundo")
      .max(300, "TIME_ROTATE_IMAGE_S no puede ser mayor a 300 segundos (5 minutos)")
      .nonoptional({ error: "TIME_ROTATE_IMAGE_S es obligatorio" })
      .describe("Tiempo en segundos para rotar las imágenes en el carrusel")
      .default(8),
    CDS_RETRY_SECONDS: z.coerce
      .number({
        error: "CDS_RETRY_SECONDS debe ser un número",
      })
      .int({ message: "CDS_RETRY_SECONDS debe ser un número entero" })
      .min(5, "CDS_RETRY_SECONDS debe ser al menos 5 segundos")
      .max(300, "CDS_RETRY_SECONDS no puede ser mayor a 300 segundos")
      .describe("Intervalo en segundos para reintentar reconexión con CDS/SSE")
      .default(60),
    API_URL_CDS: z
      .url({ error: "API_URL_CDS debe ser una URL válida" })
      .min(1, "API_URL_CDS no puede estar vacío")
      .nonempty("API_URL_CDS no puede estar vacío")
      .nonoptional({ error: "API_URL_CDS es obligatorio" })
      .describe("URL base de la API de CDS"),
    FAILED_MEDIA_COOLDOWN_S: z.coerce.number({
      error: "FAILED_MEDIA_COOLDOWN_S debe ser un número representando segundos"
    }).int({ message: "FAILED_MEDIA_COOLDOWN_S debe ser un número entero" })
      .min(0, "FAILED_MEDIA_COOLDOWN_S no puede ser negativo")
      .max(3600, "FAILED_MEDIA_COOLDOWN_S no puede ser mayor a 3600 segundos (1 hora)")
      .describe("Tiempo en segundos para evitar reintentos de medios fallidos")
      .default(5)
      .transform((seconds) => `${seconds}s` as StringValue),
    DATABASE_URL: z.string()
      .min(1, "DATABASE_URL no puede estar vacío")
      .nonempty("DATABASE_URL no puede estar vacío")
      .describe("Database connection URL"),
    MASTER_KEY: z.string()
      .min(1, "MASTER_KEY no puede estar vacío")
      .nonempty("MASTER_KEY no puede estar vacío")
      .describe("Clave maestra para operaciones administrativas"),
    DB_USER: z.string()
      .min(1, "DB_USER no puede estar vacío")
      .nonempty("DB_USER no puede estar vacío")
      .describe("Database user name"),
    DB_PASSWORD: z.string()
      .min(1, "DB_PASSWORD no puede estar vacío")
      .nonempty("DB_PASSWORD no puede estar vacío")
      .describe("Database user password"),
    DB_NAME: z.string()
      .min(1, "DB_NAME no puede estar vacío")
      .nonempty("DB_NAME no puede estar vacío")
      .describe("Database name"),
    DB_HOST: z.string()
      .min(1, "DB_HOST no puede estar vacío")
      .nonempty("DB_HOST no puede estar vacío")
      .describe("Database host"),
    DB_PORT: z.coerce.number({
      error: "DB_PORT debe ser un número",
    })
      .int({ message: "DB_PORT debe ser un número entero" })
      .min(1, "DB_PORT debe ser al menos 1")
      .max(65535, "DB_PORT no puede ser mayor a 65535")
      .describe("Database port"),
  },
  { error: "Las variables de entorno no cumplen con el esquema definido" },
);
