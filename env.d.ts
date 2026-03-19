import { StringValue } from "ms";

declare module "bun" {
  interface Env {
    URL_CONSULTA_PRECIO: string;
    NEXT_PUBLIC_TIMEOUT_SECONDS: number;
    NEXT_PUBLIC_TIME_ROTATE_IMAGE_S: number;
    NEXT_PUBLIC_CDS_RETRY_SECONDS: number;
    NEXT_PUBLIC_API_URL_CDS: string;
    NEXT_PUBLIC_API_KEY_CDS: string;
    DATABASE_URL: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_HOST: string;
    DB_PORT: StringValue;
    NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S: StringValue;
  }
}