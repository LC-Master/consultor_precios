'use client'

import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import ProductView from "@/components/ProductView";
import ErrorView from "@/components/ErrorView";
import StandbyView from "@/components/StandbyView";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useProductSearch } from "@/hooks/useProductSearch";
import { ScannerInput } from "@/components/ScannerInput";
import { IdleScreen } from "@/components/IdleScreen";
import useAppStore from "@/store/useAppStore";

export default function ConsultorUI() {
  const isConfigLoaded = useAppStore((s) => s.isConfigLoaded);
  const isConfigLoading = useAppStore((s) => s.isConfigLoading);
  const configError = useAppStore((s) => s.configError);
  const playlist = usePlaylist();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const { 
    code, 
    product, 
    loading, 
    error, 
    inputRef, 
    handlerCode, 
    handleSearch, 
    setError 
  } = useProductSearch();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isConfigLoaded && isConfigLoading) return <Loading />;

  if (loading) return <Loading />;

  // Idle: sin producto ni error (aunque haya texto tipeado)
  const isIdle = !product && !error;
  // Mostrar Standby solo si hay contenido proveniente del CDS (campañas o placeholder remoto) y hay conectividad
  const hasPlayableContent = !!(playlist?.campaigns?.length || playlist?.place_holder);
  const showStandbyLayer = isIdle && hasPlayableContent && isOnline;

  return (
    <main className="relative h-full w-full bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-4">
      {configError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-70 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800 text-sm shadow-md">
          No se pudo cargar configuracion remota. El sistema sigue operativo con capacidades limitadas.
        </div>
      )}

      {/* Standby View (Ads) - solo cuando hay contenido remoto (playlist o placeholder CDS) */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${showStandbyLayer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <StandbyView playlist={playlist} isActive={showStandbyLayer} />
      </div>

      {/* Scanner Input - Active UI & Default Placeholder UI */}
      <ScannerInput 
        inputRef={inputRef}
        code={code}
        onChange={handlerCode}
        onEnter={() => void handleSearch()}
      />

      {/* Pantalla de consulta cuando no hay contenido CDS o no estamos en standby */}
      {!showStandbyLayer && (
        <IdleScreen hidden={!!product} />
      )}

      {product && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 h-full animate-in fade-in zoom-in duration-300">
          <div className="max-h-full w-full flex items-center justify-center">
            <ProductView product={product} inputRef={inputRef} />
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <ErrorView message={error} onClose={() => setError(null)} inputRef={inputRef} />
        </div>
      )}
    </main>
  );
}
