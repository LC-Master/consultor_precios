import { useCallback } from "react";
import useAppStore from "@/store/useAppStore";

let inflightTokenRequest: Promise<string> | null = null;

export function useAuthenticatedFetch() {
    const retrySeconds = useAppStore((s) => s.config.CDS_RETRY_SECONDS);

    const fetchWithAuth = useCallback(async function <T>(url: URL | string, options: RequestInit = {}) {
        const retryMs = (() => {
            const n = Number(retrySeconds);
            return Number.isFinite(n) && n > 0 ? n * 1000 : 60_000;
        })();

        const sleep = (ms: number) => new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });

        const getStoredToken = () => {
            if (typeof window === "undefined") return null;
            try {
                return localStorage.getItem("cds_bearer_token");
            } catch {
                return null;
            }
        };

        const setStoredToken = (token: string) => {
            if (typeof window === "undefined") return;
            try {
                localStorage.setItem("cds_bearer_token", token);
            } catch {
                // Ignore storage errors.
            }
        };

        const clearStoredToken = () => {
            if (typeof window === "undefined") return;
            try {
                localStorage.removeItem("cds_bearer_token");
            } catch {
                // Ignore storage errors.
            }
        };

        const getTokenWithRetry = async () => {
            if (inflightTokenRequest) return inflightTokenRequest;

            inflightTokenRequest = (async () => {
                while (true) {
                    const response = await fetch("/api/auth", {
                        method: "GET",
                        cache: "no-store",
                        headers: { Accept: "application/json" },
                    }).catch(() => null);

                    if (response?.ok) {
                        const payload = await response.json() as { token?: string };
                        const token = typeof payload?.token === "string" ? payload.token.trim() : "";

                        if (token) {
                            setStoredToken(token);
                            return token;
                        }
                    }

                    await sleep(retryMs);
                }
            })();

            try {
                return await inflightTokenRequest;
            } finally {
                inflightTokenRequest = null;
            }
        };

        try {
            const requestUrl = url.toString();

            let token = getStoredToken();
            if (!token) {
                token = await getTokenWithRetry();
            }

            const buildHeaders = (authToken: string) => {
                const headers = new Headers(options.headers);
                headers.set("Authorization", `Bearer ${authToken}`);
                return headers;
            };

            const resp = await fetch(url.toString(), {
                ...options,
                method: options.method ?? "GET",
                headers: buildHeaders(token),
            });

            let finalResp = resp;

            if (resp.status === 401) {
                clearStoredToken();
                const refreshedToken = await getTokenWithRetry();
                finalResp = await fetch(requestUrl, {
                    ...options,
                    method: options.method ?? "GET",
                    headers: buildHeaders(refreshedToken),
                });
            }

            if (!finalResp.ok) {
                throw new Error(`Error en la petición: ${finalResp.status} ${finalResp.statusText}`);
            }

            const contentType = finalResp.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await finalResp.json() as T;
                return data;
            }

            return true as unknown as T;

        } catch (error) {
            throw error;
        }
    }, [retrySeconds]);

    return fetchWithAuth;
}
