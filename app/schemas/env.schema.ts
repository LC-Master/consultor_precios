import { StringValue } from "ms";
import z from "zod";

export const envSchema = z.object(
  {
    AUTHORIZED_IPS: z
      .string()
      .min(1, "AUTHORIZED_IPS no puede estar vacío")
      .nonempty("AUTHORIZED_IPS no puede estar vacío")
      .nonoptional({ error: "AUTHORIZED_IPS es obligatorio" })
      .transform((val) => val.split(",").map(ip => ip.trim()))
      .refine((arr) => arr.length > 0, { error: "AUTHORIZED_IPS debe contener al menos una IP válida" })
      .describe("Lista de IPs autorizadas separadas por comas"),
    NEXT_PUBLIC_API_KEY: z
      .uuidv7({ error: "NEXT_PUBLIC_API_KEY debe ser un UUIDv7 válido, ejecute refreshKey para obtener uno nuevo" })
      .min(1, "NEXT_PUBLIC_API_KEY no puede estar vacío")
      .nonempty("NEXT_PUBLIC_API_KEY no puede estar vacío")
      .nonoptional({ error: "NEXT_PUBLIC_API_KEY es obligatorio" })
      .describe("Clave API para autenticación con la API"),
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
    NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S: z.coerce.number({
      error: "NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S debe ser un número representando segundos"
    }).int({ message: "NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S debe ser un número entero" })
      .min(0, "NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S no puede ser negativo")
      .max(3600, "NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S no puede ser mayor a 3600 segundos (1 hora)")
      .describe("Tiempo en segundos para evitar reintentos de medios fallidos")
      .default(5)
      .transform((seconds) => `${seconds}s` as StringValue),
    NEXT_PUBLIC_API_KEY_CDS: z
      .jwt({ error: "NEXT_PUBLIC_API_KEY_CDS debe ser un JWT válido" })
      .min(1, "NEXT_PUBLIC_API_KEY_CDS no puede estar vacío")
      .nonempty("NEXT_PUBLIC_API_KEY_CDS no puede estar vacío")
      .nonoptional({ error: "NEXT_PUBLIC_API_KEY_CDS es obligatorio" })
      .describe("Clave API JWT para autenticación con la API de CDS"),
    DATABASE_URL: z.string()
      .min(1, "DATABASE_URL no puede estar vacío")
      .nonempty("DATABASE_URL no puede estar vacío")
      .describe("Database connection URL"),
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
