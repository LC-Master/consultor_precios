declare module "bun" {
  interface Env {
    URL_CONSULTA_PRECIO: string;
    API_KEY_CMS: string;
    DB_NAME: string;
    DATABASE_URL: string;
    NEXT_PUBLIC_TIMEOUT_MS: StringValue;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_API_KEY_CDS:string;
  }
}