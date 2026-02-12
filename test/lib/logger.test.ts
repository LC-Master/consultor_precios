import { describe, expect, it } from "bun:test";

// We re-import with NODE_ENV=development to cover pretty transport branch

describe("logger", () => {
    it("should create logger with transports and allow logging", async () => {
        const previousEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";

        // Dynamic import to pick up the env change
        const { logger } = await import("@/lib/logger");

        expect(typeof logger.info).toBe("function");
        logger.info("test info message");
        logger.error({ msg: "error payload" });

        // restore env
        process.env.NODE_ENV = previousEnv;
    });
});
