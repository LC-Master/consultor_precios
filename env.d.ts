declare module "bun" {
  interface Env {
    URL_CONSULTA_PRECIO: string;
    NEXT_PUBLIC_TIMEOUT_SECONDS: StringValue;
    NEXT_PUBLIC_API_URL_CDS: string;
    NEXT_PUBLIC_API_KEY_CDS:string;
  }
}