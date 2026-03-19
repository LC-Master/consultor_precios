import { formatMoney } from "@/lib/formatMoney";
import { Product } from "@/types/product.type";
import Image from "next/image";
import SavingsBadge from "./SavingsBadge";

export default function ProductView({ product, inputRef }: { product: Product, inputRef: React.RefObject<HTMLInputElement | null> }) {
    if (!product) return null;

    const hasPromotion = !!product.promotion;
    const promotionLabel = product.promotion?.name?.trim() || "Descuento Especial";
    // According to types provided:
    // Prices struct has: base, tax, priceWithTax, referencePrice
    // Promotion struct has: name, basePrice, priceWithTax, referencePrice, discountPercentage, savings

    const priceBs = hasPromotion ? product.promotion!.priceWithTax : product.prices.priceWithTax;
    const oldPriceBs = product.prices.priceWithTax;

    const priceRef = hasPromotion ? product.promotion!.referencePrice : product.prices.referencePrice;

    // Ensure we handle oldPriceRef properly, falling back to base referencePrice if null
    const oldPriceRef = product.prices.referencePrice;

    return (
        <div
            className="w-full max-w-[95vw] md:max-w-8xl bg-white rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[88vh] border border-slate-100 grow hover:scale-105 transition-transform duration-500"
            onClick={(e) => {
                e.stopPropagation();
                inputRef?.current?.focus();
            }}
        >
            <div className="w-full md:w-5/12 bg-slate-50 relative flex items-center justify-center min-h-88 md:min-h-0">
                <div className="absolute inset-0 bg-locatel-medio/5"></div>
                <div className="relative w-full h-full p-6 flex items-center justify-center">
                    <Image
                        src={product.imageUrl || '/locatel.webp'}
                        alt={product.description || "Producto"}
                        fill
                        className="object-contain p-2 mix-blend-multiply transition-transform duration-500 hover:scale-105"
                        priority
                    />
                </div>
            </div>

            <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-5 flex flex-col overflow-y-auto">
                <div className="mb-4 relative">
                    {(product.isBlocked || hasPromotion) && (
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-2 border ${hasPromotion
                                ? "bg-locatel-medio text-white border-locatel-medio shadow-md"
                                : "bg-slate-800 text-white border-slate-800"
                                }`}
                        >
                            {hasPromotion && <span className="material-icons text-[12px] leading-none">local_offer</span>}
                            {product.isBlocked ? "Bloqueado" : promotionLabel}
                        </span>
                    )}
                    <h2 className="text-2xl md:text-2xl font-extrabold text-slate-800 leading-tight wrap-break-words hyphens-auto">
                        {product.description || "Artículo"}
                    </h2>
                    <div className="text-slate-400 font-medium mt-0.5 text-xs">
                        Código: {product.articleCode}
                    </div>
                </div>

                <div className="flex gap-3 mb-4 relative">
                    {hasPromotion && (
                        <div className="absolute -top-4 -right-3 z-20 bg-locatel-oro text-white w-18 h-18 rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12 border-2 border-white">
                            <span className="text-[16px] font-bold leading-none">-{product.promotion?.discountPercentage}%</span>
                        </div>
                    )}

                    <div className={`flex-1 bg-slate-50 p-3 rounded-xl border flex flex-col items-center text-center ${hasPromotion ? "border-locatel-medio/10" : "border-slate-200"}`}>
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Bolívares</span>
                        <div className="flex flex-col">
                            {hasPromotion && (
                                <span className="text-[18px] line-through text-slate-400 decoration-red-400/50">
                                    {formatMoney(oldPriceBs, "Bs")}
                                </span>
                            )}
                            <div className="text-locatel-medio font-extrabold text-2xl md:text-3xl">
                                {formatMoney(priceBs, "Bs")}
                            </div>
                        </div>
                        <div className="flex flex-col items-center mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400">IVA INC.</span>
                            <span className="text-[11px] font-medium text-slate-400/80">
                                (IVA 16%: {formatMoney(hasPromotion ? product.promotion?.taxAmount : product.prices.taxAmount, "Bs")})
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 bg-locatel-medio text-white p-3 rounded-xl shadow-lg shadow-locatel-medio/20 flex flex-col items-center text-center">
                        <span className="text-[12px] font-black uppercase tracking-widest text-white/70 mb-0.5">Precio Ref</span>
                        <div className="flex flex-col">
                            {hasPromotion && (
                                <span className="text-[18px] line-through text-gray-200 decoration-red-500/90">
                                    {formatMoney(oldPriceRef, "Ref")}
                                </span>
                            )}
                            <div className="font-extrabold text-2xl md:text-3xl">
                                {formatMoney(priceRef, "Ref")}
                            </div>
                        </div>
                        {hasPromotion && (
                            <span className="text-[10px] font-bold text-white/70 mt-0.5">PRECIO REF PROM</span>
                        )}
                    </div>

                </div>

                {hasPromotion && (
                    <div className="flex flex-row gap-4 mb-4">
                        <SavingsBadge value={product.promotion?.savings} currency="Bs" />
                        <SavingsBadge value={product.promotion?.dolarSavings} currency="Ref" />
                    </div>
                )}

                <div className={`grid gap-2 ${hasPromotion ? "grid-cols-4" : "grid-cols-3"}`}>
                    {!hasPromotion && (
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="block text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Precio Base</span>
                            <span className="text-[10px] font-bold text-slate-700 leading-none truncate block">
                                {formatMoney(product.prices.base, "Bs")}
                            </span>
                        </div>
                    )}


                    {hasPromotion && (
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="block text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Precio Base Prom</span>
                            <span className="text-[10px] font-bold text-slate-700 leading-none truncate block">
                                {formatMoney(product.promotion?.basePrice, "Bs")}
                            </span>
                        </div>
                    )}
                    {/* <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-3 h-3 bg-slate-200 rounded-bl-full"></div>
                        <span className="block text-[7px] font-black text-slate-500 uppercase tracking-tighter mb-0.5 relative z-10">IVA ({product.prices.tax}%)</span>
                        <span className="text-[10px] font-bold text-slate-800 leading-none truncate block relative z-10">
                            {formatMoney(hasPromotion ? product.promotion?.taxAmount : product.prices.taxAmount, "Bs")}
                        </span>
                    </div> */}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex justify-end mt-3">
                        <div className="flex items-center gap-4 bg-slate-100/80 border border-slate-200 p-1.5 px-4 rounded-lg shadow-sm">

                            {/* Tasa USD */}
                            <div className="flex flex-col border-r border-slate-300 pr-4 last:border-0 last:pr-0">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter leading-tight">Tasa BCV USD</span>
                                <span className="text-[13px] font-black text-slate-800 tabular-nums leading-none">
                                    {formatMoney(product.rate?.dollar, "Bs")}
                                </span>
                            </div>

                            {/* Tasa EURO */}
                            <div className="flex flex-col border-r border-slate-300 pr-4 last:border-0 last:pr-0">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter leading-tight">Tasa BCV EURO</span>
                                <span className="text-[13px] font-black text-slate-800 tabular-nums leading-none">
                                    {formatMoney(product.rate?.euro, "Bs")}
                                </span>
                            </div>

                            {/* Fecha Vigencia */}
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">Vence</span>
                                <span className="text-[11px] font-bold text-slate-600 tabular-nums leading-none">
                                    {product.rate?.validDate ? new Date(product.rate.validDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>

                        </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                        {product.barCode}
                    </div>
                </div>
            </div>
        </div>
    )
}
