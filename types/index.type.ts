export interface MediaItem {
  id: string;
  fileType: string;
  url: string;
  start_at: string;
  end_at: string;
  duration?: number;
  position?: number;
}

export interface PlaylistData {
  am: MediaItem[];
  pm: MediaItem[];
  place_holder?: { id: string; fileType: string; url?: string };
}

export interface StandbyViewProps {
  playlist: PlaylistData;
  isActive?: boolean;
}

