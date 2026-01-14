import { IProduct } from "@/types/product.type";
import Image from "next/image";

function formatMoney(value: number | null | undefined, currency: "Bs" | "$" | "€" = "Bs") {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return `${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}
export default function ProductView({ product, inputRef }: { product: IProduct, inputRef: React.RefObject<HTMLInputElement | null> }) {
    if (!product) {
        return (
            <div>
                <h2>No se encontró el producto.</h2>
            </div>
        );
    }
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

                        <div className={`min-w-0 min-h-0 space-y-4 flex flex-col ${product?.promotion ? "self-start items-start text-left" : "self-center items-center text-center justify-center"}`}>
                            {product.promotion ? (
                                <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-locatel-medio px-3 py-1 rounded-full text-xs sm:text-sm mb-3">
                                    {product.promotion.name}
                                </span>
                            ) : null}

                            <h1 className="text-slate-900 font-semibold tracking-tight text-2xl sm:text-3xl leading-tight">
                                {product.description || "Artículo"}
                            </h1>

                            <div className={`mt-2 flex items-end gap-3 flex-wrap ${product?.promotion ? "" : "justify-center"}`}>
                                {product.promotion ? (
                                    <span className="text-slate-400 line-through text-sm sm:text-base">
                                        {formatMoney(product.prices.priceWithTax, "Bs")} IVA INC.
                                    </span>
                                ) : null}

                                <div className="flex items-end gap-3 flex-wrap">
                                    <div className="flex items-end gap-2">
                                        <span className="text-locatel-medio font-extrabold text-5xl sm:text-6xl leading-none">
                                            {product.promotion ? formatMoney(product.promotion.priceWithTax, "Bs") : formatMoney(product.prices.priceWithTax, "Bs") ?? "Sin precio"}
                                        </span>
                                        {product.prices.priceWithTax ? (
                                            <span className="text-slate-500 text-sm sm:text-base pb-1">IVA INC.</span>
                                        ) : null}
                                    </div>

                                    {product.promotion ? (
                                        <div className="shrink-0 rounded-full w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-b from-locatel-medio to-locatel-oscuro text-white shadow-lg ring-4 ring-white/70 flex items-center justify-center">
                                            <div className="text-center leading-none">
                                                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">-{product.promotion?.discountPercentage || 0}%</div>
                                                <div className="text-[10px] sm:text-[11px] uppercase tracking-widest opacity-90 mt-0.5">Ahorro</div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {product.promotion ? (
                                <div className={`mt-2 text-sm text-locatel-naranja ${product?.promotion?.name ? "" : "text-center"}`}>
                                    Ahorras {formatMoney(product.promotion.savings, "Bs")}
                                </div>
                            ) : null}

                            <div className={`mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 ${product?.promotion ? "" : "justify-center"}`}>
                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio base</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.prices.base, "Bs") ?? "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio IVA</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.prices.priceWithTax, "Bs") ?? "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio ref</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.prices.referencePrice, "$") ?? "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">IVA</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {`${product.prices.tax ?? "-"}%`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Base prom</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.promotion?.basePrice, "Bs") ?? "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">IVA prom</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.promotion?.priceWithTax, "Bs") ?? "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Ref prom</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {formatMoney(product.promotion?.referencePrice, "$") ?? "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Código art</div>
                                            <div className="text-base font-semibold text-slate-800 truncate">
                                                {(product.articleCode ?? "-")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 px-5 sm:px-8 py-3 text-xs sm:text-sm text-slate-500 flex flex-wrap gap-x-6 gap-y-2">
                    <span>CÓD BARRA: {product.barCode}</span>
                    <span>TASA: {formatMoney(product.rate.dollar, "$") ?? "-"}</span>
                    <span>TASA EUR: {formatMoney(product.rate.euro, "€") ?? "-"}</span>
                </div>
            </div>
        </div>
    )
};