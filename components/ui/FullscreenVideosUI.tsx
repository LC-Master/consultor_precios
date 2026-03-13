'use client';

import StandbyView from '@/components/StandbyView';
import { usePlaylist } from '@/hooks/usePlaylist';

export default function FullscreenVideosUI() {
  const playlist = usePlaylist();

  return (
    <main className="h-full w-full bg-black">
      <div className="fixed inset-0 z-50 bg-black">
        <StandbyView playlist={playlist} isActive videoOnly />
      </div>
    </main>
  );
}
