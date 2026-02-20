import { useState, useRef, useEffect, ChangeEvent } from 'react';
import ms, { type StringValue } from "ms";
import type { Product } from "@/types/product.type";
import getProduct from "@/lib/getProduct";

export function useProductSearch() {
  const TIMEOUT = `${process.env.NEXT_PUBLIC_TIMEOUT_SECONDS}s` || "25s";
  const TIMEOUT_MS = ms(TIMEOUT as StringValue);

  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlerCode = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (error) setError(null);
  }

  const handleSearch = async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    setProduct(null);
    try {
      const data = await getProduct<Product>(code);
      setProduct(data);
    } catch (err: unknown) {
      console.error(err);
      setError("No pudimos encontrar información para este código. Por favor verifique e intente nuevamente.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setCode("");
      setProduct(null);
      setError(null);
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [code, product, error, TIMEOUT_MS]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return {
    code,
    product,
    loading,
    error,
    inputRef,
    handlerCode,
    handleSearch,
    setError
  };
}
