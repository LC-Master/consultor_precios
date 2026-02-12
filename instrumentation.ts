import { envSchema } from "./app/schemas/env.schema";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("@/lib/logger");
    const parsedEnv = envSchema.safeParse(process.env);

    if (!parsedEnv.success) {
      logger.fatal({ 
        msg: "Error de validación de variables de entorno", 
        errors: parsedEnv.error.issues 
      });

      process.exit(1);
    }
  }
}
