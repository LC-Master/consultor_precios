'use client'

import { useEffect, useRef, useState, type ChangeEvent, useMemo, useCallback } from "react";
import ms, { type StringValue } from "ms";
import type { Product } from "@/types/product.type";
import Loading from "@/components/ui/Loading";
import ProductView from "@/components/ProductView";
import ErrorView from "@/components/ErrorView";
import getProduct from "@/lib/getProduct";
import { Input } from "@/components/ui/Input";
import StandbyView, { type PlaylistData } from "@/components/StandbyView";

// Utility for deep comparison
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

export default function ConsultorUI() {
  const TIMEOUT = `${process.env.NEXT_PUBLIC_TIMEOUT_SECONDS}s` || "25s";
  // Initialize with empty playlist so StandbyView can render its default state even if API fails
  const [playlist, setPlaylist] = useState<PlaylistData>({ am: [], pm: [] });
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

  const eventUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "events"), []);
  const authUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "auth/login/device"), []);

  const fetchWithAuth = useCallback(async function <T>(url: URL) {
    try {
      const resp = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_CDS}`
        }
      });

      if (!resp.ok) {
        console.error(`Fetch Error: ${resp.status} ${resp.statusText}`);
        throw new Error(`Error en la petición: ${resp.status} ${resp.statusText}`);
      }

      const data = await resp.json() as T;
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; 
    }
  }, []);

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

      const fetchPlaylist = async () => {
         try {
             // Inferred type from API based on usage
             interface ApiPlaylistRoot {
                am: { id: string; fileType: string; start_at: string; end_at: string; duration?: number }[];
                pm: { id: string; fileType: string; start_at: string; end_at: string; duration?: number }[];
                place_holder: { id: string; fileType: string } | null;
             }

             const resp = await fetchWithAuth<ApiPlaylistRoot>(new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "playlist"));
             
             if (resp) {
                 // DATA TRANSFORMATION: Map ID to full URL
                 const baseUrl = process.env.NEXT_PUBLIC_API_URL_CDS + "media/";

                 const transformItem = (item: { id: string, fileType: string, start_at: string, end_at: string, duration?: number }) => ({
                    ...item,
                    url: `${baseUrl}${item.id}.${item.fileType}`
                 });
                 
                 const transformedPlaylist: PlaylistData = {
                     am: resp.am?.map(item => transformItem(item)) || [],
                     pm: resp.pm?.map(item => transformItem(item)) || [],
                     place_holder: resp.place_holder 
                        ? {
                            id: resp.place_holder.id,
                            fileType: resp.place_holder.fileType,
                            url: `${baseUrl}${resp.place_holder.id}.${resp.place_holder.fileType}`
                          }
                        : undefined
                 };

                 setPlaylist(prev => {
                     if (deepEqual(prev, transformedPlaylist)) {
                         console.log("Playlist unchanged, skipping update.");
                         return prev;
                     }
                     console.log("Updating playlist...", transformedPlaylist);
                     return transformedPlaylist;
                 });
             }
         } catch (err) {
             console.error("Error updating playlist:", err);
         }
      };

      const handlePlaylistUpdate = async (e: MessageEvent) => {
         const data = JSON.parse(e.data);
         console.log("Event Received:", data);
         await fetchPlaylist();
      };

      event.addEventListener("ping", (e) => {
        console.log("Ping recibido:", JSON.parse(e.data));
      });
      
      event.addEventListener("dto:updated", handlePlaylistUpdate);
      event.addEventListener("playlist:generated", handlePlaylistUpdate);

      // Initial fetch to ensure we have data immediately
      void fetchPlaylist();

      event.onerror = async () => {
        event.close();
        
        try {
            const check = await fetch(urlConToken.toString());
            if (check.status === 401) {
              console.log("Token inválido, re-autenticando...");
              localStorage.removeItem("token");
              await fetchAuth();
              initializeEventSource();
            }
        } catch (error) {
            console.error("Error verifying token on SSE disconnect:", error);
            // Optionally retry connection after delay
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
  }, [authUrl, eventUrl, fetchWithAuth]);


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
      setError("No pudimos encontrar información para este código. Por favor verifique e intente nuevamente.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (loading) return <Loading />;

  // Determine if we are in "Standby" (Idle) mode:
  // No active product result, no error message, no user typing (code is empty).
  const isStandby = !product && !error && !code;
  const hasContent = playlist && (playlist.am.length > 0 || playlist.pm.length > 0 || !!playlist.place_holder);

  return (
    <main className="relative h-full w-full bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Standby View (Ads) - Always mounted to preserve state, toggled via CSS/prop */}
      {/* Only visible if there is actual content to show. Otherwise, it hides to let Scanner Input show. */}
      {/* Removed bg-white from wrapper so it doesn't block the view when empty/transitioning */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${isStandby && hasContent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <StandbyView playlist={playlist} isActive={isStandby && !!hasContent} />
      </div>

      {/* Scanner Input - Active UI & Default Placeholder UI */}
      {/* Input Logic: Always in DOM to capture scans, but visually hidden */}
      <div className="fixed inset-0 z-40 opacity-0 w-0 h-0 overflow-hidden pointer-events-none">
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
            onBlur={() => {
                 setTimeout(() => inputRef.current?.focus(), 10);
            }}
            className="w-full h-full"
          />
      </div>

      {/* Offline/Empty State Visuals - "Consulta Aquí" Modal */}
      {/* Only rendered if there is NO content (Ads/Server Placeholder) in the playlist */}
      {!hasContent && (
        <div className={`relative z-10 w-full flex-1 flex flex-col items-center justify-center transition-all duration-300 ${product ? 'opacity-0' : 'opacity-100'}`}>
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-xl animate-in fade-in zoom-in duration-500">
                <div className="bg-locatel-medio/10 p-6 rounded-full mb-6 animate-pulse">
                     <span className="material-icons text-8xl text-locatel-medio">qr_code_scanner</span>
                </div>
                <h1 className="text-5xl font-black text-slate-800 tracking-widest uppercase mb-4">Consulta Aquí</h1>
                <div className="h-1 w-24 bg-locatel-medio rounded-full mb-4"></div>
                <p className="text-slate-400 text-xl font-medium">Escanea el código de barras de tu producto</p>
            </div>
        </div>
      )}

      {product && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 h-full animate-in fade-in zoom-in duration-300">
          <div className="max-h-full w-full flex items-center justify-center">
            <ProductView product={product} inputRef={inputRef} />
          </div>
        </div>
      )}

      {error && (
         <div className="absolute inset-0 z-50 flex items-center justify-center">
            <ErrorView message={error} onClose={() => setError(null)} inputRef={inputRef} />
         </div>
      )}
    </main>
  );
}