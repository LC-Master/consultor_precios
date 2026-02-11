import { Product } from "@/types/product.type";
import Image from "next/image";

function formatMoney(value: number | null | undefined, currency: "Bs" | "$" | "€" = "Bs") {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return `${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value)} ${currency}`;
}

export default function ProductView({ product, inputRef }: { product: Product, inputRef: React.RefObject<HTMLInputElement | null> }) {
    if (!product) return null;

    const hasPromotion = !!product.promotion;
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
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[80vh] border border-slate-100"
            onClick={(e) => {
                e.stopPropagation();
                inputRef?.current?.focus();
            }}
        >
            <div className="w-full md:w-5/12 bg-slate-50 relative flex items-center justify-center min-h-62.5 md:min-h-0">
                 <div className="absolute inset-0 bg-locatel-medio/5"></div>
                 <div className="relative w-full h-full p-6 flex items-center justify-center">
                    <Image
                        src="/test.webp"
                        alt={product.description || "Producto"}
                        fill
                        className="object-contain p-2 mix-blend-multiply transition-transform duration-500 hover:scale-105"
                        priority
                    />
                </div>
            </div>

            <div className="w-full md:w-7/12 p-5 flex flex-col overflow-y-auto">
                <div className="mb-4 relative">
                    <span className="inline-block px-2 py-0.5 bg-locatel-medio/10 text-locatel-medio text-[9px] font-bold uppercase tracking-widest rounded-full mb-2">
                       {product.isBlocked ? "Bloqueado" : (product.promotion?.name || "Regular")}
                    </span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-tight wrap-break-words hyphens-auto">
                        {product.description  || "Artículo"}
                    </h2>
                    <div className="text-slate-400 font-medium mt-0.5 text-xs">
                        Código: {product.articleCode}
                    </div>
                </div>

                <div className="flex gap-3 mb-4 relative">
                    {hasPromotion && (
                        <div className="absolute -top-2 -right-1 z-20 bg-locatel-oro text-white w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12 border-2 border-white">
                             <span className="text-[10px] font-bold leading-none">-{product.promotion?.discountPercentage}%</span>
                        </div>
                    )}
                    
                    <div className={`flex-1 bg-slate-50 p-3 rounded-xl border flex flex-col items-center text-center ${hasPromotion ? "border-locatel-medio/10" : "border-slate-200"}`}>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Bolívares</span>
                        <div className="flex flex-col">
                            {hasPromotion && (
                                <span className="text-[9px] line-through text-slate-400 decoration-red-400/50">
                                    {formatMoney(oldPriceBs, "Bs")}
                                </span>
                            )}
                            <div className="text-locatel-medio font-extrabold text-xl md:text-2xl">
                                {formatMoney(priceBs, "Bs")} <span className="text-xs ml-0.5">Bs</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center mt-0.5">
                            <span className="text-[8px] font-bold text-slate-400">IVA INC.</span>
                            <span className="text-[7px] font-medium text-slate-400/80">
                                (IVA: {formatMoney(hasPromotion ? product.promotion?.taxAmount : product.prices.taxAmount, "Bs")})
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 bg-locatel-medio text-white p-3 rounded-xl shadow-lg shadow-locatel-medio/20 flex flex-col items-center text-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/70 mb-0.5">Dólares</span>
                        <div className="flex flex-col">
                             {hasPromotion && (
                                <span className="text-[9px] line-through text-white/50 decoration-white/30">
                                    {formatMoney(oldPriceRef, "$")}
                                </span>
                            )}
                            <div className="font-extrabold text-xl md:text-2xl">
                                {formatMoney(priceRef, "$")} <span className="text-xs ml-0.5">$</span>
                            </div>
                        </div>
                         {hasPromotion && (
                            <span className="text-[8px] font-bold text-white/70 mt-0.5">PRECIO REF PROM</span>
                        )}
                    </div>
                </div>

                {hasPromotion && (
                    <div className="mb-4 flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit text-xs">
                        <span className="material-icons text-sm">trending_down</span>
                        Ahorra: {formatMoney(product.promotion?.savings, "Bs")}
                    </div>
                )}

                <div className={`grid gap-2 ${hasPromotion ? "grid-cols-4" : "grid-cols-3"}`}>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="block text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Precio Base</span>
                        <span className="text-[10px] font-bold text-slate-700 leading-none truncate block">
                            {formatMoney(product.prices.base, "Bs")}
                        </span>
                    </div>

                    {hasPromotion && (
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="block text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Precio Base Prom</span>
                                <span className="text-[10px] font-bold text-slate-700 leading-none truncate block">
                                {formatMoney(product.promotion?.basePrice, "Bs")}
                            </span>
                        </div>
                    )}

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="block text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Precio Ref</span>
                        <span className="text-[10px] font-bold text-slate-700 leading-none truncate block">
                                {formatMoney(priceRef, "$")}
                        </span>
                    </div>
                
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-3 h-3 bg-slate-200 rounded-bl-full"></div>
                        <span className="block text-[7px] font-black text-slate-500 uppercase tracking-tighter mb-0.5 relative z-10">IVA ({product.prices.tax}%)</span>
                        <span className="text-[10px] font-bold text-slate-800 leading-none truncate block relative z-10">
                            {formatMoney(hasPromotion ? product.promotion?.taxAmount : product.prices.taxAmount, "Bs")}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">BCV:</span>
                            <span className="text-[10px] font-bold text-slate-700">{formatMoney(product.rate?.dollar, "Bs")}</span>
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">EUR:</span>
                            <span className="text-[10px] font-bold text-slate-700">{formatMoney(product.rate?.euro, "Bs")}</span>
                        </div>
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                        {product.barCode}
                    </div>
                </div>
            </div>
        </div>
    )
}
