export default async function getProduct<T>(code: string): Promise<T> {
    const result = await fetch(`/api/check-price?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
    });

    if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || 'Error fetching product data');
    }

    const data = await result.json();

    return data as T;
}