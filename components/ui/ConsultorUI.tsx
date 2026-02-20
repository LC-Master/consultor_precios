'use client'

import Loading from "@/components/ui/Loading";
import ProductView from "@/components/ProductView";
import ErrorView from "@/components/ErrorView";
import StandbyView from "@/components/StandbyView";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useProductSearch } from "@/hooks/useProductSearch";
import { ScannerInput } from "@/components/ScannerInput";
import { IdleScreen } from "@/components/IdleScreen";

export default function ConsultorUI() {
  const playlist = usePlaylist();
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

  if (loading) return <Loading />;

  // Determine if we are in "Standby" (Idle) mode:
  // No active product result, no error message, no user typing (code is empty).
  const isStandby = !product && !error && !code;
  const hasContent = playlist && ((playlist.campaigns && playlist.campaigns.length > 0) || !!playlist.place_holder);

  return (
    <main className="relative h-full w-full bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Standby View (Ads) - Always mounted to preserve state, toggled via CSS/prop */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${isStandby && hasContent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <StandbyView playlist={playlist} isActive={isStandby && !!hasContent} />
      </div>

      {/* Scanner Input - Active UI & Default Placeholder UI */}
      <ScannerInput 
        inputRef={inputRef}
        code={code}
        onChange={handlerCode}
        onEnter={() => void handleSearch()}
      />

      {/* Offline/Empty State Visuals - "Consulta Aquí" Modal */}
      {!hasContent && (
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
