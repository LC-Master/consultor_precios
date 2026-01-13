'use client'

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import ms, { type StringValue } from "ms";
import { consultarArticulo } from "./actions/consultar-articulo";
import type { Product } from "@/types/product.type";
import Loading from "@/components/ui/Loading";
import ProductView from "@/components/ProductView";

export default function ConsultorUI() {
  const TIMEOUT = process.env.NEXT_PUBLIC_TIMEOUT_MS || "5s";
  const TIMEOUT_MS = ms(TIMEOUT as StringValue);
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  console.log(product)
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
      setProduct(result as Product);
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
      {product && <ProductView product={product} inputRef={inputRef} />}
    </main>
  );
}
