import { logger } from "@/lib/logger";

export async function GET() {
    logger.info("Health check endpoint called");
    return Response.json({ message: "Server is up", status: "OK", uptime: process.uptime() });
}