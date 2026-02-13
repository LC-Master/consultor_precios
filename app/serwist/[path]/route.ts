import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// Handle git possibly failing or not being present
let revision;
try {
    revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim();
} catch (error) {
    console.error("Failed to get git revision:", error);
}

if (!revision) {
    revision = crypto.randomUUID();
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
});