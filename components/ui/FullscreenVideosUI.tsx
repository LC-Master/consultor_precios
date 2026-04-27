'use client';

import StandbyView from '@/components/StandbyView';
import Loading from '@/components/ui/Loading';
import { usePlaylist } from '@/hooks/usePlaylist';
import useAppStore from '@/store/useAppStore';

export default function FullscreenVideosUI() {
  const isConfigLoaded = useAppStore((s) => s.isConfigLoaded);
  const configError = useAppStore((s) => s.configError);
  const playlist = usePlaylist();

  if (!isConfigLoaded) {
    return <Loading />;
  }

  if (configError) {
    return (
      <main className="h-full w-full bg-black flex items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl bg-white shadow-xl border border-slate-200 p-6 text-center">
          <h2 className="text-2xl font-extrabold text-slate-800">Configuración no disponible</h2>
          <p className="mt-3 text-slate-600">{configError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full w-full bg-black">
      <div className="fixed inset-0 z-50 bg-black">
        <StandbyView playlist={playlist} isActive overlay={false} />
      </div>
    </main>
  );
}
