import { useState, useRef, useEffect, useMemo } from 'react';
import { PlaylistData, ApiPlaylistRoot} from "@/types/index.type";
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { deepEqual } from '@/lib/deepEqual';

export function usePlaylist() {
    const [playlist, setPlaylist] = useState<PlaylistData>({ campaigns: [] });
    const latestPlaylistRef = useRef<PlaylistData>({ campaigns: [] });
    const eventSourceRef = useRef<EventSource | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const playlistPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastClientRefreshAtRef = useRef(0);
    const fetchWithAuth = useAuthenticatedFetch();

    const eventUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "events"), []);
    const authUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "auth/login/device"), []);
    const mediaBaseUrl = useMemo(() => new URL("media/", process.env.NEXT_PUBLIC_API_URL_CDS).toString(), []);

    useEffect(() => {
        const PLAYLIST_POLL_MS = 5 * 60 * 1000;
        const CLIENT_REFRESH_THROTTLE_MS = 90 * 1000;

        const fetchPlaylist = async () => {
            try {
                const resp = await fetchWithAuth<ApiPlaylistRoot>(new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "playlist"));

                if (resp) {
                    const normalizeFileType = (fileType?: string, fallback = 'jpg') => {
                        const normalized = fileType?.replace('.', '').trim().toLowerCase();
                        return normalized || fallback;
                    };

                    const buildMediaUrl = (id: string, fileType: string) => `${mediaBaseUrl}${id}.${fileType}`;

                    const transformItem = (item: { id: string, fileType?: string, start_at: string, end_at: string, duration?: number, position?: number }) => {
                        const normalizedFileType = normalizeFileType(item.fileType, 'jpg');
                        return {
                            ...item,
                            fileType: normalizedFileType,
                            url: buildMediaUrl(item.id, normalizedFileType)
                        };
                    };

                    const campaigns = resp.campaigns || [];

                    const transformedCampaigns = campaigns.map((campaign) => ({
                        ...campaign,
                        am: (campaign.am || []).map(item => transformItem(item)).sort((a, b) => (a.position || 0) - (b.position || 0)),
                        pm: (campaign.pm || []).map(item => transformItem(item)).sort((a, b) => (a.position || 0) - (b.position || 0))
                    }));

                    const transformedPlaylist: PlaylistData = {
                        campaigns: transformedCampaigns,
                        place_holder: resp.place_holder
                            ? {
                                id: resp.place_holder.id,
                                fileType: normalizeFileType(resp.place_holder.fileType, 'jpg'),
                                url: buildMediaUrl(resp.place_holder.id, normalizeFileType(resp.place_holder.fileType, 'jpg'))
                            }
                            : undefined
                    };

                    const hasPlaylistChanged = !deepEqual(latestPlaylistRef.current, transformedPlaylist);

                    // Preload
                    const preloadMedia = (url: string, fileType: string) => {
                        return new Promise<void>((resolve) => {
                            const isVideo = ['mp4', 'webm', 'ogg', 'mov'].some(ext => fileType.toLowerCase().includes(ext));
                            if (isVideo) {
                                const video = document.createElement('video');
                                video.preload = 'metadata';
                                video.onloadeddata = () => {
                                    video.src = '';
                                    resolve();
                                };
                                video.onerror = () => {
                                    video.src = '';
                                    resolve();
                                };
                                video.src = url;
                                video.load();
                            } else {
                                const img = new Image();
                                img.onload = () => {
                                    img.src = '';
                                    resolve();
                                };
                                img.onerror = () => {
                                    img.src = '';
                                    resolve();
                                };
                                img.src = url;
                            }
                        });
                    };

                    const items: { url: string; fileType: string }[] = transformedCampaigns.flatMap((c) => [
                        ...c.am,
                        ...c.pm
                    ]);

                    if (transformedPlaylist.place_holder && transformedPlaylist.place_holder.url) {
                        items.push({
                            url: transformedPlaylist.place_holder.url,
                            fileType: transformedPlaylist.place_holder.fileType
                        });
                    }

                    if (hasPlaylistChanged) {
                        const MAX_PRELOAD = 12;
                        const uniqueItems = Array.from(new Map(items.map(item => [item.url, item])).values());
                        const limitedItems = uniqueItems.slice(0, MAX_PRELOAD);
                        const promises = limitedItems.map(item => preloadMedia(item.url, item.fileType));
                        if (promises.length > 0) {
                            void Promise.all(promises);
                        }
                    }

                    latestPlaylistRef.current = transformedPlaylist;
                    setPlaylist(prev => hasPlaylistChanged ? transformedPlaylist : prev);

                    if (hasPlaylistChanged) {
                        window.dispatchEvent(new CustomEvent('playlist:refresh-success'));
                    }
                }
            } catch {
                return;
            }
        };

        const initializeEventSource = () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (eventSourceRef.current) eventSourceRef.current.close();

            const event = new EventSource(eventUrl, {
                withCredentials: true
            });
            eventSourceRef.current = event;

            const handlePlaylistUpdate = async () => {
                await fetchPlaylist();
            };

            event.addEventListener("ping", () => undefined);
            event.addEventListener("dto:updated", handlePlaylistUpdate);
            event.addEventListener("playlist:generated", handlePlaylistUpdate);
            event.addEventListener("open", () => {
                void fetchPlaylist();
            });

            event.onerror = async () => {
                event.close();
                retryTimeoutRef.current = setTimeout(() => {
                    initializeEventSource();
                }, 60000);
            };
        };

        const handleClientRefresh = () => {
            const now = Date.now();
            if (now - lastClientRefreshAtRef.current < CLIENT_REFRESH_THROTTLE_MS) return;
            lastClientRefreshAtRef.current = now;
            void fetchPlaylist();
        };

        const bootstrap = async () => {
            try {
                await fetchWithAuth(authUrl, { credentials: "include" });
                initializeEventSource();
                void fetchPlaylist();

                if (playlistPollIntervalRef.current) clearInterval(playlistPollIntervalRef.current);
                playlistPollIntervalRef.current = setInterval(() => {
                    void fetchPlaylist();
                }, PLAYLIST_POLL_MS);
            } catch {
                retryTimeoutRef.current = setTimeout(bootstrap, 60000);
            }
        };

        window.addEventListener('playlist:client-refresh', handleClientRefresh);
        bootstrap();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (playlistPollIntervalRef.current) clearInterval(playlistPollIntervalRef.current);
            window.removeEventListener('playlist:client-refresh', handleClientRefresh);
        };
    }, [authUrl, eventUrl, fetchWithAuth, mediaBaseUrl]);

    return playlist;
}
