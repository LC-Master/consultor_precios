import { StringValue } from "ms";

declare module "bun" {
  interface Env {
    URL_CONSULTA_PRECIO: string;
    NEXT_PUBLIC_TIMEOUT_SECONDS: StringValue;
    NEXT_PUBLIC_API_URL_CDS: string;
    NEXT_PUBLIC_API_KEY: string;
    NEXT_PUBLIC_API_KEY_CDS: string;
    DATABASE_URL: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_HOST: string;
    DB_PORT: StringValue;
    AUTHORIZED_IPS: string;
    NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S: StringValue;
  }
}