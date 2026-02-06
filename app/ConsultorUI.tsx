'use client'

import { useEffect, useRef, useState, type ChangeEvent, useMemo } from "react";
import ms, { type StringValue } from "ms";
import type { Product } from "@/types/product.type";
import Loading from "@/components/ui/Loading";
import ProductView from "@/components/ProductView";
import ErrorView from "@/components/ErrorView";
import getProduct from "@/lib/getProduct";
import { Input } from "@/components/ui/Input";

export default function ConsultorUI() {
  const TIMEOUT = `${process.env.NEXT_PUBLIC_TIMEOUT_SECONDS}s` || "25s";
  const [playlist, setPlaylist] = useState<Root | null>(null);
  const TIMEOUT_MS = ms(TIMEOUT as StringValue);
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  interface Root {
    am: Am[]
    pm: Pm[]
    place_holder: string
  }

  interface Am {
    id: string
    fileType: string
    start_at: string
    end_at: string
  }

  interface Pm {
    id: string
    fileType: string
    start_at: string
    end_at: string
  }


  const handlerCode = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (error) setError(null);
  }

  const eventUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "events"), []);
  const authUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "auth/login/device"), []);

  async function fetchWithAuth<T>(url: URL) {
    try {
      const resp = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_CDS}`
        }
      });

      if (!resp.ok) {
        throw new Error(`Error en la autenticación: ${resp.statusText}`);
      }

      const data = await resp.json() as T;
      console.log(data)
      return data;
    } catch (error) {
      console.error("Error al obtener el token de autenticación:", error);
      throw new Error("Error al autenticar. Por favor, intente nuevamente.");
    }
  };

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const resp = await fetch(authUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_CDS}`
          }
        });
        console.log("Respuesta de autenticación:", resp);
        if (!resp.ok) {
          throw new Error(`Error en la autenticación: ${resp.statusText}`);
        }

        const data = await resp.json();
        if (!data.token) {
          throw new Error("Token no válido en la respuesta del servidor");
        }
        localStorage.setItem("token", data.token);
      } catch (error) {
        console.error("Error al obtener el token de autenticación:", error);
        setError("Error al autenticar. Por favor, intente nuevamente.");
      }
    };

    const initializeEventSource = () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token no disponible");

      const urlConToken = new URL(eventUrl.toString());
      urlConToken.searchParams.set("token", token);

      const event = new EventSource(urlConToken.toString());

      event.addEventListener("ping", (e) => {
        console.log("Ping recibido:", JSON.parse(e.data));
      });
      event.addEventListener("dto:updated", async (e) => {
        const data = JSON.parse(e.data);
        console.log("¡Actualización de DTO recibida!", data);
        const resp = await fetchWithAuth<Root>(new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "playlist"))
          .catch(err => {
            console.error("Error al obtener la playlist actualizada:", err);
            setError("Error al obtener la playlist actualizada. Por favor, intente nuevamente.");
          });
        if (resp) {
          setPlaylist(resp);
        }
      });
      event.addEventListener("playlist:generated", async (e) => {
        const data = JSON.parse(e.data);
        console.log("¡Actualización de DTO recibida!", data);
        const resp = await fetchWithAuth<Root>(new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "playlist"))
          .catch(err => {
            console.error("Error al obtener la playlist actualizada:", err);
            setError("Error al obtener la playlist actualizada. Por favor, intente nuevamente.");
          });
        if (resp) {
          setPlaylist(resp);
        }
      });

      event.onerror = async () => {
        event.close();

        const check = await fetch(urlConToken.toString());
        if (check.status === 401) {
          console.log("Token inválido, re-autenticando...");
          localStorage.removeItem("token");
          await fetchAuth();
          initializeEventSource();
        }
      };
      return () => event.close();
    }
    if (!localStorage.getItem("token")) {
      void fetchAuth().then(() => {
        if (localStorage.getItem("token")) {
          initializeEventSource();
        } else {
          console.error("Token no se guardó correctamente en el almacenamiento local.");
          setError("Error al guardar el token de autenticación.");
        }
      });
    } else {
      initializeEventSource();
    }
  }, [authUrl, eventUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCode("");
      setProduct(null);
      setError(null);
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [code, product, error, TIMEOUT_MS]);

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
      setError("Producto no encontrado");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (loading) return <Loading />;

  return (
    <main className="relative h-full w-full bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-4">
      <div className={`w-full max-w-2xl px-4 transition-all duration-300 ${product || error ? 'opacity-0 pointer-events-none absolute scale-95' : 'opacity-100 scale-100'}`}>
        <div className="relative w-full group">
          <div className="absolute -inset-1 bg-linear-to-r from-locatel-medio/20 to-blue-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
          <div className="relative">
            <span className="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-locatel-medio text-2xl pointer-events-none select-none animate-pulse">qr_code_scanner</span>
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={handlerCode}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") void handleSearch();
              }}
              aria-label="Escáner de código de barras"
              className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-14 pr-4 font-mono text-xl text-slate-700 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-locatel-medio/10 focus:border-locatel-medio/50 h-auto transition-all shadow-xl shadow-slate-200/50"
              placeholder="Escanea el código aquí..."
            />
          </div>
        </div>
        <p className="mt-8 text-center text-slate-400 text-xs font-bold tracking-widest uppercase opacity-50">Sistema de consulta de precios</p>
      </div>

      {product && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 h-full animate-in fade-in zoom-in duration-300">
          <div className="max-h-full w-full flex items-center justify-center p-4">
            <ProductView product={product} inputRef={inputRef} />
          </div>
        </div>
      )}

      {error && (
        <ErrorView message={error} onClose={() => setError(null)} inputRef={inputRef} />
      )}
    </main>
  );
}