import { envSchema } from "./app/schemas/env.schema";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const parsedEnv = envSchema.safeParse(process.env);

    if (!parsedEnv.success) {
      console.error(
        "Error de validación de variables de entorno:",
        parsedEnv.error.issues,
      );

      process.exit(1);
    }
  }
}
