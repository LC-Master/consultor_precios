'use client'

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import ms, { type StringValue } from "ms";
import { consultarArticulo } from "./actions/consultar-articulo";
import type { Product } from "@/types/product.type";
import Product1Json from "../public/product.json";
import Loading from "@/components/ui/Loading";

const Product1 = Product1Json as Product;

function normalizeProduct(result: unknown): Product | null {
  if (!result) return null;
  if (Array.isArray(result)) return (result[0] as Product) ?? null;
  return result as Product;
}

function formatMoney(value: number | null | undefined, currency: "Bs" | "$" | "€" = "Bs") {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return `${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

export default function ConsultorUI() {
  const TIMEOUT = process.env.NEXT_PUBLIC_TIMEOUT_MS || "5s";
  const TIMEOUT_MS = ms(TIMEOUT as StringValue);
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(Product1);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeProduct = product ?? Product1;

  const pricing = useMemo(() => {
    const hasPromo = Boolean(activeProduct?.NomProm) && (activeProduct?.PrecioIVAProm ?? 0) > 0;
    const finalPrice = hasPromo
      ? activeProduct.PrecioIVAProm
      : (activeProduct.PrecioIva ?? 0) > 0
        ? activeProduct.PrecioIva
        : activeProduct.PrecioBase;
    const originalPrice = hasPromo ? activeProduct.PrecioIva || activeProduct.PrecioBase : null;
    const savings = hasPromo && typeof originalPrice === "number" && typeof finalPrice === "number"
      ? Math.max(0, originalPrice - finalPrice)
      : null;
    return { hasPromo, finalPrice, originalPrice, savings };
  }, [activeProduct]);

  const handlerCode = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setCode("");
      setProduct(null);
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [code, product, TIMEOUT_MS]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setProduct(null);
    try {
      const result = await consultarArticulo(code);
      setProduct(normalizeProduct(result));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <main className="h-full w-full bg-linear-to-b from-slate-100 via-white to-slate-100 overflow-hidden">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={code}
        onChange={handlerCode}
        onKeyDown={(e) => {
          if (e.key === "Enter") void handleSearch();
        }}
        className="sr-only caret-transparent"
        aria-label="Escáner de código de barras"
      />

      <div
        className="h-full w-full box-border min-h-0 flex items-center justify-center p-3 sm:p-4 lg:p-6"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="w-full max-w-7xl max-h-full h-full bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 flex-1 min-h-0 overflow-hidden">
            <div className="min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
              <div className="relative bg-linear-to-br from-slate-50 via-white to-slate-50 rounded-2xl p-6 flex items-center justify-center ring-1 ring-slate-200">
                <Image
                  src="/test.webp"
                  alt="Imagen del producto"
                  width={420}
                  height={420}
                  className="rounded-xl object-contain max-h-72 sm:max-h-80 w-auto"
                  priority
                />

                {pricing.hasPromo ? (
                  <div className="absolute top-4 right-4">
                    <div className="rounded-full w-24 h-24 bg-linear-to-b from-locatel-medio to-locatel-oscuro text-white shadow-lg ring-4 ring-white/70 flex items-center justify-center">
                      <div className="text-center leading-none">
                        <div className="text-3xl font-extrabold tracking-tight">-{activeProduct.PorcDesc || 0}%</div>
                        <div className="text-[11px] uppercase tracking-widest opacity-90 mt-0.5">Ahorro</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 min-h-0">
                {activeProduct.NomProm ? (
                  <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-locatel-medio px-3 py-1 rounded-full text-xs sm:text-sm mb-3">
                    {activeProduct.NomProm}
                  </span>
                ) : null}

                <h1 className="text-slate-900 font-semibold tracking-tight text-2xl sm:text-3xl leading-tight">
                  {activeProduct.Descripcion || "Artículo"}
                </h1>

                <div className="mt-3 flex items-end gap-3 flex-wrap">
                  {pricing.originalPrice ? (
                    <span className="text-slate-400 line-through text-sm sm:text-base">
                      {formatMoney(pricing.originalPrice, "Bs")}
                    </span>
                  ) : null}

                  <div className="flex items-end gap-2">
                    <span className="text-locatel-medio font-extrabold text-5xl sm:text-6xl leading-none">
                      {formatMoney(pricing.finalPrice, "Bs") ?? "Sin precio"}
                    </span>
                    {(activeProduct.PrecioIva ?? 0) > 0 ? (
                      <span className="text-slate-500 text-sm sm:text-base pb-1">IVA INC.</span>
                    ) : null}
                  </div>
                </div>

                {pricing.savings ? (
                  <div className="mt-3 text-sm text-locatel-naranja">
                    Ahorras {formatMoney(pricing.savings, "Bs")}
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio base</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {formatMoney(activeProduct.PrecioBase, "Bs") ?? "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio IVA</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {(activeProduct.PrecioIva ?? 0) > 0 ? formatMoney(activeProduct.PrecioIva, "Bs") : "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">Precio ref</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {formatMoney(activeProduct.PrecioRef, "$") ?? "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">IVA</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {typeof activeProduct.Iva === "number" ? `${activeProduct.Iva}%` : "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">Base prom</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {(activeProduct.PrecioBaseProm ?? 0) > 0 ? formatMoney(activeProduct.PrecioBaseProm, "Bs") : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">IVA prom</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {(activeProduct.PrecioIVAProm ?? 0) > 0 ? formatMoney(activeProduct.PrecioIVAProm, "Bs") : "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">Ref prom</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {(activeProduct.PrecioRefProm ?? 0) > 0 ? formatMoney(activeProduct.PrecioRefProm, "$") : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">Código art</div>
                        <div className="text-base font-semibold text-slate-800 truncate">
                          {activeProduct.CodArticulo ? String(activeProduct.CodArticulo) : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 px-5 sm:px-8 py-3 text-xs sm:text-sm text-slate-500 flex flex-wrap gap-x-6 gap-y-2">
            <span>CÓD BARRA: {activeProduct.CodBarra ? String(activeProduct.CodBarra) : "-"}</span>
            <span>TASA: {formatMoney(activeProduct.Tasa, "$") ?? "-"}</span>
            <span>TASA EUR: {formatMoney(activeProduct.TasaEuro, "€") ?? "-"}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
