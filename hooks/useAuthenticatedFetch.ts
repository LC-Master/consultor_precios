import { useCallback } from "react";

export function useAuthenticatedFetch() {
    const fetchWithAuth = useCallback(async function <T>(url: URL | string, options: RequestInit = {}) {
        try {
            const resp = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_CDS}`,
                    ...options.headers
                },
                ...options
            });

            if (!resp.ok) {
                console.error(`Fetch Error: ${resp.status} ${resp.statusText}`);
                throw new Error(`Error en la petición: ${resp.status} ${resp.statusText}`);
            }

            const contentType = resp.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await resp.json() as T;
                return data;
            }

            return true as unknown as T;

        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    }, []);

    return fetchWithAuth;
}
