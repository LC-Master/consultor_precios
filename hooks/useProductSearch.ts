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
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (!hideTimerRef.current) return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  };

  const scheduleHide = () => {
    clearHideTimer();

    if (!Number.isFinite(TIMEOUT_MS) || TIMEOUT_MS <= 0) return;

    hideTimerRef.current = setTimeout(() => {
      setCode("");
      setProduct(null);
      setError(null);
      hideTimerRef.current = null;
    }, TIMEOUT_MS);
  };

  const handlerCode = (e: ChangeEvent<HTMLInputElement>) => {
    clearHideTimer();
    setCode(e.target.value);
    if (error) setError(null);
  }

  const handleSearch = async () => {
    const searchCode = code.trim();
    if (!searchCode) return;

    clearHideTimer();
    setLoading(true);
    setError(null);
    setProduct(null);
    setCode("");

    try {
      const data = await getProduct<Product>(searchCode);
      setProduct(data);
      scheduleHide();
    } catch (err: unknown) {
      console.error(err);
      setError("No pudimos encontrar información para este código. Por favor verifique e intente nuevamente.");
      scheduleHide();
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  useEffect(() => {
    inputRef.current?.focus();

    return () => {
      clearHideTimer();
    };
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
