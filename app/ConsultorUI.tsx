'use client'

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import ms, { type StringValue } from "ms";
import type { IProduct } from "@/types/product.type";
import Loading from "@/components/ui/Loading";
import ProductView from "@/components/ProductView";
import getProduct from "@/lib/getProduct";

export default function ConsultorUI() {
  const TIMEOUT = `${process.env.NEXT_PUBLIC_TIMEOUT_SECONDS}s` || "25s";
  const TIMEOUT_MS = ms(TIMEOUT as StringValue);
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const data = await getProduct<IProduct>(code);
      setProduct(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (loading) return <Loading />;

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
        aria-label="Escáner de código de barras"
      />
      {product && <ProductView product={product} inputRef={inputRef} />}
    </main>
  );
}