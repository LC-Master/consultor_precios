import { formatMoney } from "@/lib/formatMoney";

export default function SavingsBadge({ value, currency }: { value: number | null | undefined, currency: "Bs" | "Ref" | "€" }) {
    if (!currency) {
        currency = "Bs";
    }
    return (
        <div className="flex-1 flex items-center justify-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 text-xs">
            <span className="material-icons text-sm">savings</span>
            Ahorra: {formatMoney(value, currency)}
        </div>
    )
}