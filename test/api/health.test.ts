import { describe, expect, it } from "bun:test";
import { GET } from '../../app/api/route'

describe("Api Health Tests", () => {
    it("should return healthy status", async () => {
        const response = await GET();
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data).toHaveProperty("message", "Server is up");
        expect(data).toHaveProperty("status", "OK");
        expect(data).toHaveProperty("uptime");
    });
    it("should have uptime greater than 0", async () => {
        const response = await GET();
        const data = await response.json();
        expect(data.uptime).toBeGreaterThan(0);
    });
    it("should return JSON content type", async () => {
        const response = await GET();
        expect(response.headers.get("Content-Type")).toContain("application/json");
    });
    it("should work with load testing", async () => {
        const requests = Array.from({ length: 100 }, () => GET());
        const responses = await Promise.all(requests);
        responses.forEach(response => {
            expect(response.status).toBe(200);
        });
    })
})