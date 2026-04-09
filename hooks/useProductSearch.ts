import { useState, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import ms from "ms";
import type { Product } from "@/types/product.type";
import getProduct from "@/lib/getProduct";
import useAppStore from '@/store/useAppStore';

export function useProductSearch() {
  const { config } = useAppStore();
  const TIMEOUT_MS = useMemo(() => {
    const timeout = Number(config.TIMEOUT_SECONDS);

    if (!Number.isFinite(timeout) || timeout <= 0) {
      return ms("25s");
    }

    return timeout * 1000;
  }, [config.TIMEOUT_SECONDS]);

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
    } catch {
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
