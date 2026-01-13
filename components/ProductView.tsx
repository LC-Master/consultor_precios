import { Product } from "@/types/product.type";
import Image from "next/image";
import { useMemo } from "react";

function formatMoney(value: number | null | undefined, currency: "Bs" | "$" | "€" = "Bs") {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return `${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}
export default function ProductView({ product, inputRef }: { product: Product, inputRef: React.RefObject<HTMLInputElement | null> }) {
    const pricing = useMemo(() => {
        const hasPromo = Boolean(product?.NomProm) && (product?.PrecioIVAProm ?? 0) > 0;
        const finalPrice = hasPromo
            ? product.PrecioIVAProm
            : (product.PrecioIva ?? 0) > 0
                ? product.PrecioIva
                : product.PrecioBase;
        const originalPrice = hasPromo ? product.PrecioIva || product.PrecioBase : null;
        const savings = hasPromo && typeof originalPrice === "number" && typeof finalPrice === "number"
            ? Math.max(0, originalPrice - finalPrice)
            : null;
        return { hasPromo, finalPrice, originalPrice, savings };
    }, [product]);

    return (
        <div
            className="h-full w-full box-border min-h-0 flex items-center justify-center p-3 sm:p-4 lg:p-6"
            onClick={() => inputRef?.current?.focus()}
        >
            <div className="w-full max-w-7xl max-h-full h-full bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 sm:p-6 lg:p-8 flex-1 min-h-0 overflow-hidden">
                    <div className="min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
                        <div className="relative bg-linear-to-br from-slate-50 via-white to-slate-50 rounded-2xl p-6 flex items-center justify-center  md:self-stretch">
                            <Image
                                src="/test.webp"
                                alt="Imagen del producto"
                                width={420}
                                height={420}
                                className="rounded-xl object-contain max-h-72 sm:max-h-80 w-auto"
                                priority
                            />
                        </div>

                        <div className={`min-w-0 min-h-0 space-y-4 flex flex-col ${product?.NomProm ? "self-start items-start text-left" : "self-center items-center text-center justify-center"}`}>
                            {product.NomProm ? (
                                <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-locatel-medio px-3 py-1 rounded-full text-xs sm:text-sm mb-3">
                                    {product.NomProm}
                                </span>
                            ) : null}

                            <h1 className="text-slate-900 font-semibold tracking-tight text-2xl sm:text-3xl leading-tight">
                                {product.Descripcion || "Artículo"}
                            </h1>

                            <div className={`mt-2 flex items-end gap-3 flex-wrap ${product?.NomProm ? "" : "justify-center"}`}>
                                {pricing.originalPrice ? (
                                    <span className="text-slate-400 line-through text-sm sm:text-base">
                                        {formatMoney(pricing.originalPrice, "Bs")}
                                    </span>
                                ) : null}

                                <div className="flex items-end gap-3 flex-wrap">
                                    <div className="flex items-end gap-2">
                                        <span className="text-locatel-medio font-extrabold text-5xl sm:text-6xl leading-none">
                                            {formatMoney(pricing.finalPrice, "Bs") ?? "Sin precio"}
                                        </span>
                                        {(product.PrecioIva ?? 0) > 0 ? (
                                            <span className="text-slate-500 text-sm sm:text-base pb-1">IVA INC.</span>
                                        ) : null}
                                    </div>

                                    {pricing.hasPromo ? (
                                        <div className="shrink-0 rounded-full w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-b from-locatel-medio to-locatel-oscuro text-white shadow-lg ring-4 ring-white/70 flex items-center justify-center">
                                            <div className="text-center leading-none">
                                                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">-{product.PorcDesc || 0}%</div>
                                                <div className="text-[10px] sm:text-[11px] uppercase tracking-widest opacity-90 mt-0.5">Ahorro</div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {pricing.savings ? (
                                <div className={`mt-2 text-sm text-locatel-naranja ${product?.NomProm ? "" : "text-center"}`}>
                                    Ahorras {formatMoney(pricing.savings, "Bs")}
                                </div>
                            ) : null}

                            <div className={`mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 ${product?.NomProm ? "" : "justify-center"}`}>
                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio base</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.PrecioBase, "Bs") ?? "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio IVA</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {(product.PrecioIva ?? 0) > 0 ? formatMoney(product.PrecioIva, "Bs") : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio ref</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.PrecioRef, "$") ?? "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">IVA</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {typeof product.Iva === "number" ? `${product.Iva}%` : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Base prom</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {(product.PrecioBaseProm ?? 0) > 0 ? formatMoney(product.PrecioBaseProm, "Bs") : "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">IVA prom</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {(product.PrecioIVAProm ?? 0) > 0 ? formatMoney(product.PrecioIVAProm, "Bs") : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Ref prom</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {(product.PrecioRefProm ?? 0) > 0 ? formatMoney(product.PrecioRefProm, "$") : "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Código art</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {product.CodArticulo ? String(product.CodArticulo) : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 px-5 sm:px-8 py-3 text-xs sm:text-sm text-slate-500 flex flex-wrap gap-x-6 gap-y-2">
                    <span>CÓD BARRA: {product.CodBarra ? String(product.CodBarra) : "-"}</span>
                    <span>TASA: {formatMoney(product.Tasa, "$") ?? "-"}</span>
                    <span>TASA EUR: {formatMoney(product.TasaEuro, "€") ?? "-"}</span>
                </div>
            </div>
        </div>
    )
};