export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export default async function getProduct<T>(code: string): Promise<T> {
    const result = await fetch(`/api/check-price?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new ApiError(
            result.status,
            errorData.message || errorData.error || 'Error fetching product data',
            errorData.error
        );
    }

    const data = await result.json();

    return data as T;
}