import { StringValue } from "ms";

declare module "bun" {
  interface Env {
    URL_CONSULTA_PRECIO: string;
    TIMEOUT_SECONDS: number;
    TIME_ROTATE_IMAGE_S: number;
    API_URL_CDS_FRONT: string;
    CDS_RETRY_SECONDS: number;
    API_URL_CDS: string;
    DATABASE_URL: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_HOST: string;
    DB_PORT: StringValue;
    FAILED_MEDIA_COOLDOWN_S: StringValue;
    MASTER_KEY: string;
  }
}