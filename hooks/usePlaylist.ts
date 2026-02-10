import { useState, useRef, useEffect, useMemo } from 'react';
import { PlaylistData, ApiPlaylistRoot, MediaItem, Campaign } from "@/types/index.type";
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { deepEqual } from '@/lib/deepEqual';

export function usePlaylist() {
    const [playlist, setPlaylist] = useState<PlaylistData>({ campaigns: [] });
    const eventSourceRef = useRef<EventSource | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fetchWithAuth = useAuthenticatedFetch();

    const eventUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "events"), []);
    const authUrl = useMemo(() => new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "auth/login/device"), []);

    useEffect(() => {
        const initializeEventSource = () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (eventSourceRef.current) eventSourceRef.current.close();

            console.log("Conectando al SSE...");
            const event = new EventSource(eventUrl, {
                withCredentials: true
            });
            eventSourceRef.current = event;

            const fetchPlaylist = async () => {
                try {
                    const resp = await fetchWithAuth<ApiPlaylistRoot>(new URL(process.env.NEXT_PUBLIC_API_URL_CDS + "playlist"));

                    if (resp) {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL_CDS + "media/";
                        
                        const transformItem = (item: { id: string, fileType?: string, start_at: string, end_at: string, duration?: number, position?: number }) => ({
                            ...item,
                            fileType: item.fileType || 'jpg',
                            url: `${baseUrl}${item.id}.${item.fileType || 'jpg'}`
                        });

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
                                    fileType: resp.place_holder.fileType,
                                    url: `${baseUrl}${resp.place_holder.id}.${resp.place_holder.fileType}`
                                }
                                : undefined
                        };

                        // Preload
                        const preloadMedia = (url: string, fileType: string) => {
                            return new Promise<void>((resolve) => {
                                const isVideo = ['mp4', 'webm', 'ogg', 'mov'].some(ext => fileType.toLowerCase().includes(ext));
                                if (isVideo) {
                                    const video = document.createElement('video');
                                    video.preload = 'auto';
                                    video.onloadeddata = () => resolve();
                                    video.onerror = () => {
                                        console.warn(`Failed to preload video: ${url}`);
                                        resolve();
                                    };
                                    video.src = url;
                                    video.load();
                                } else {
                                    const img = new Image();
                                    img.onload = () => resolve();
                                    img.onerror = () => {
                                        console.warn(`Failed to preload image: ${url}`);
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

                        const promises = items.map(item => preloadMedia(item.url, item.fileType));
                        if (promises.length > 0) await Promise.all(promises);

                        setPlaylist(prev => {
                            if (deepEqual(prev, transformedPlaylist)) return prev;
                            console.log("Playlist actualizada/recuperada:", transformedPlaylist);
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

            event.addEventListener("ping", (e) => console.log(e));
            event.addEventListener("dto:updated", handlePlaylistUpdate);
            event.addEventListener("playlist:generated", handlePlaylistUpdate);
            event.addEventListener("open", () => {
                console.log("Conexión SSE Establecida");
                void fetchPlaylist();
            });

            event.onerror = async () => {
                console.error("Error en conexión SSE (Closed/Error).");
                event.close();
                console.log("Intentando reconectar en 1 minuto...");
                retryTimeoutRef.current = setTimeout(() => {
                    console.log("Ejecutando reintento de conexión...");
                    initializeEventSource();
                }, 60000);
            };
        };

        const bootstrap = async () => {
            try {
                await fetchWithAuth(authUrl, { credentials: "include" });
                console.log("Autenticación exitosa");
                initializeEventSource();
            } catch (error) {
                console.error("Error al obtener el token de autenticación:", error);
                console.error("No se pudo obtener token, reintentando bootstrap en 60s");
                retryTimeoutRef.current = setTimeout(bootstrap, 60000);
            }
        };

        bootstrap();

        return () => {
            if (eventSourceRef.current) {
                console.log("Limpiando conexión SSE");
                eventSourceRef.current.close();
            }
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        };
    }, [authUrl, eventUrl, fetchWithAuth]);

    return playlist;
}
