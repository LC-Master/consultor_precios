import { useState, useRef, useEffect } from 'react';
import { PlaylistData, ApiPlaylistRoot } from "@/types/index.type";
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { deepEqual } from '@/lib/deepEqual';
import useAppStore from '../store/useAppStore';

export function usePlaylist() {
    const { config, isConfigLoaded, configError } = useAppStore()
    const [playlist, setPlaylist] = useState<PlaylistData>({ campaigns: [] });
    const latestPlaylistRef = useRef<PlaylistData>({ campaigns: [] });
    const eventSourceRef = useRef<EventSource | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const playlistPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastClientRefreshAtRef = useRef(0);
    const isBootstrappingRef = useRef(false);
    const fetchWithAuth = useAuthenticatedFetch();
    const configuredRetrySeconds = Number(config.CDS_RETRY_SECONDS);
    const RETRY_DELAY_MS = Number.isFinite(configuredRetrySeconds) && configuredRetrySeconds > 0
        ? configuredRetrySeconds * 1000
        : 60_000;

    useEffect(() => {
        if (!isConfigLoaded || configError) return;

        const eventUrl = new URL("events", config.API_URL_CDS);
        const authUrl = new URL("auth/login/device", config.API_URL_CDS);
        const mediaBaseUrl = new URL("media/", config.API_URL_CDS).toString();

        const PLAYLIST_POLL_MS = 5 * 60 * 1000;
        const CLIENT_REFRESH_THROTTLE_MS = 90 * 1000;

        const fetchPlaylist = async () => {
            try {
                const resp = await fetchWithAuth<ApiPlaylistRoot>(new URL(config.API_URL_CDS + "playlist"));

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
                // Si CDS falla, limpiamos playlist para evitar mostrar ads cacheados
                latestPlaylistRef.current = { campaigns: [] };
                setPlaylist({ campaigns: [] });
                return;
            }
        };

        function scheduleRetry(immediate = false) {
            if (immediate) {
                if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                    retryTimeoutRef.current = null;
                }
                void bootstrap();
                return;
            }
            if (retryTimeoutRef.current) return;
            retryTimeoutRef.current = setTimeout(() => {
                retryTimeoutRef.current = null;
                bootstrap();
            }, RETRY_DELAY_MS);
        }

        function initializeEventSource() {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }

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
                eventSourceRef.current = null;
                // Limpia para no usar contenido cacheado si se pierde SSE/CDS
                latestPlaylistRef.current = { campaigns: [] };
                setPlaylist({ campaigns: [] });
                scheduleRetry();
            };
        }

        const handleClientRefresh = () => {
            const now = Date.now();
            if (now - lastClientRefreshAtRef.current < CLIENT_REFRESH_THROTTLE_MS) return;
            lastClientRefreshAtRef.current = now;
            void fetchPlaylist();
        };

        const bootstrap = async () => {
            if (isBootstrappingRef.current) return;
            isBootstrappingRef.current = true;
            try {
                await fetchWithAuth(authUrl, { credentials: "include" });
                initializeEventSource();
                void fetchPlaylist();

                if (playlistPollIntervalRef.current) clearInterval(playlistPollIntervalRef.current);
                playlistPollIntervalRef.current = setInterval(() => {
                    void fetchPlaylist();
                }, PLAYLIST_POLL_MS);
            } catch {
                // Si CDS no responde, limpia playlist y agenda reintento
                latestPlaylistRef.current = { campaigns: [] };
                setPlaylist({ campaigns: [] });
                scheduleRetry();
            } finally {
                isBootstrappingRef.current = false;
            }
        };

        window.addEventListener('playlist:client-refresh', handleClientRefresh);
        const handleOnline = () => scheduleRetry(true);
        window.addEventListener('online', handleOnline);

        bootstrap();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (playlistPollIntervalRef.current) clearInterval(playlistPollIntervalRef.current);
            window.removeEventListener('playlist:client-refresh', handleClientRefresh);
            window.removeEventListener('online', handleOnline);
        };
    }, [fetchWithAuth, isConfigLoaded, config.API_URL_CDS, configError, RETRY_DELAY_MS]);

    return playlist;
}
