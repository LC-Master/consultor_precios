export interface MediaItem {
  id: string;
  fileType: string;
  url: string;
  start_at: string;
  end_at: string;
  duration?: number;
  position?: number;
}

export interface Campaign {
  id: string;
  name: string;
  am: MediaItem[];
  pm: MediaItem[];
}

export interface PlaylistData {
  campaigns?: Campaign[];
  place_holder?: { id: string; fileType: string; url?: string };
}

export interface StandbyViewProps {
  playlist: PlaylistData;
  isActive?: boolean;
}

export interface ApiPlaylistRoot {
  campaigns: {
    id: string;
    name: string;
    am: { id: string; fileType?: string; start_at: string; end_at: string; duration?: number; position?: number }[];
    pm: { id: string; fileType?: string; start_at: string; end_at: string; duration?: number; position?: number }[];
  }[];
  place_holder: { id: string; fileType: string } | null;
}


