'use client';

import { usePlaylist } from "@/hooks/usePlaylist";
import TvPlayer from "@/components/tv/TvPlayer";

export default function TvPage() {
    const playlist = usePlaylist();

    return (
        <TvPlayer playlist={playlist} isActive={true} />
    );
}
