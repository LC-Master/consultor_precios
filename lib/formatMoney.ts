export function formatMoney(value: number | null | undefined, currency: "Bs" | "Ref" | "€" = "Bs") {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return `${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value)} ${currency}`;
}