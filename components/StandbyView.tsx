'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { parseISO } from 'date-fns';
import InfoOverlay from './modals/InfoOverlay';
import { StandbyViewProps, MediaItem } from '@/types/index.type';
import ms from 'ms';
import { isVideo } from '@/lib/isVideo';
import FallBackPost from './ui/FallBackPost';
import PosImageCarousel from './ui/PosImageCarousel';

export default function StandbyView({ playlist, isActive = true, videoOnly = false }: StandbyViewProps) {
    const configuredCooldownSeconds = Number(process.env.NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S);
    const FAILED_MEDIA_COOLDOWN_MS = Number.isFinite(configuredCooldownSeconds) && configuredCooldownSeconds > 0
        ? configuredCooldownSeconds * 1000
        : ms('5s');
    const MEDIA_ROTATE_IMAGE_S = Number.isFinite(Number(process.env.NEXT_PUBLIC_TIME_ROTATE_IMAGE_S)) && Number(process.env.NEXT_PUBLIC_TIME_ROTATE_IMAGE_S) > 0
        ? Number(process.env.NEXT_PUBLIC_TIME_ROTATE_IMAGE_S) * 1000
        : ms('8s');
    const CLIENT_REFRESH_THROTTLE_MS = ms('90s');
    const MIN_FAILED_MEDIA_COOLDOWN_MS = ms('60s');
    const MAX_FAILED_MEDIA_COOLDOWN_MS = ms('15m');
    const [allValidItems, setAllValidItems] = useState<MediaItem[]>([]);
    const [failedUntilByUrl, setFailedUntilByUrl] = useState<Record<string, number>>({});
    const failedUntilByUrlRef = useRef<Record<string, number>>({});
    const failureCountByUrlRef = useRef<Record<string, number>>({});
    const lastRefreshRequestAtRef = useRef(0);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [isMainVideoReady, setIsMainVideoReady] = useState(false);
    const [placeholderMediaFailed, setPlaceholderMediaFailed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
    const retryTimeoutByUrlRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Independent indices for fluid decoupling
    const [mainIndex, setMainIndex] = useState(0);
    const [sideIndex, setSideIndex] = useState(0);

    // Filter content by time of day and schedule
    useEffect(() => {
        const updateContent = () => {
            const now = new Date();
            const hour = now.getHours();
            const isAm = hour < 12;

            // Collect all items from all campaigns for the current time slot
            const sourceList: MediaItem[] = [];
            if (playlist.campaigns) {
                playlist.campaigns.forEach(campaign => {
                    const primarySlot = isAm ? campaign.am : campaign.pm;
                    const fallbackSlot = isAm ? campaign.pm : campaign.am;

                    // Best Practice: POS (videoOnly) adheres strictly to the scheduled slot.
                    // Consultor (Check mode) retains backwards compatibility (uses fallback if empty).
                    const selectedList = (primarySlot?.length ?? 0) > 0
                        ? primarySlot
                        : (videoOnly ? [] : fallbackSlot);

                    if (selectedList) sourceList.push(...selectedList);
                });
            }

            // Filter by Date Range validity (ISO Strings)
            const validItems = sourceList.filter(item => {
                if (item.start_at && item.end_at) {
                    const start = parseISO(item.start_at);
                    const end = parseISO(item.end_at);
                    return now >= start && now <= end;
                }
                return true;
            });

            // If list has changed, update.
            setAllValidItems(prev => {
                if (prev.length !== validItems.length) return validItems;
                let changed = false;
                for (let i = 0; i < prev.length; i++) {
                    if (prev[i].id !== validItems[i].id || prev[i].fileType !== validItems[i].fileType || prev[i].url !== validItems[i].url) {
                        changed = true;
                        break;
                    }
                }
                return changed ? validItems : prev;
            });
        };

        updateContent();
        const interval = setInterval(updateContent, ms('60s'));
        return () => clearInterval(interval);
    }, [playlist, videoOnly]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNowMs(Date.now());
        }, ms('1s'));
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        failedUntilByUrlRef.current = failedUntilByUrl;
    }, [failedUntilByUrl]);

    useEffect(() => {
        setPlaceholderMediaFailed(false);
    }, [playlist.place_holder?.url, playlist.place_holder?.fileType]);

    useEffect(() => {
        const handlePlaylistRefreshSuccess = () => {
            // Keep backoff state so refresh-success does not instantly re-enable failed URLs.
            setNowMs(Date.now());
        };

        window.addEventListener('playlist:refresh-success', handlePlaylistRefreshSuccess);
        return () => {
            window.removeEventListener('playlist:refresh-success', handlePlaylistRefreshSuccess);
        };
    }, []);

    useEffect(() => {
        return () => {
            Object.values(retryTimeoutByUrlRef.current).forEach(clearTimeout);
            retryTimeoutByUrlRef.current = {};
        };
    }, []);

    const requestPlaylistRefresh = useCallback(() => {
        const now = Date.now();
        if (now - lastRefreshRequestAtRef.current < CLIENT_REFRESH_THROTTLE_MS) return;
        lastRefreshRequestAtRef.current = now;
        window.dispatchEvent(new CustomEvent('playlist:client-refresh'));
    }, [CLIENT_REFRESH_THROTTLE_MS]);

    const markMediaTemporarilyFailed = useCallback((item: MediaItem | null, reason: string) => {
        if (!item?.url) return;

        const currentRetryAt = failedUntilByUrlRef.current[item.url];
        if (currentRetryAt && currentRetryAt > Date.now()) return false;

        const nextFailures = (failureCountByUrlRef.current[item.url] || 0) + 1;
        failureCountByUrlRef.current[item.url] = nextFailures;

        const adaptiveCooldownMs = Math.min(
            Math.max(
                FAILED_MEDIA_COOLDOWN_MS * Math.max(1, nextFailures),
                MIN_FAILED_MEDIA_COOLDOWN_MS
            ),
            MAX_FAILED_MEDIA_COOLDOWN_MS
        );
        const retryAt = Date.now() + adaptiveCooldownMs;

        setFailedUntilByUrl(prev => ({
            ...prev,
            [item.url]: retryAt,
        }));

        requestPlaylistRefresh();

        const existingTimeout = retryTimeoutByUrlRef.current[item.url];
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        retryTimeoutByUrlRef.current[item.url] = setTimeout(() => {
            setFailedUntilByUrl(prev => {
                const currentRetryAt = prev[item.url];
                if (!currentRetryAt || currentRetryAt > Date.now()) return prev;
                const next = { ...prev };
                delete next[item.url];
                return next;
            });
            delete retryTimeoutByUrlRef.current[item.url];
        }, adaptiveCooldownMs + 250);

        return true;
    }, [FAILED_MEDIA_COOLDOWN_MS, MIN_FAILED_MEDIA_COOLDOWN_MS, MAX_FAILED_MEDIA_COOLDOWN_MS, requestPlaylistRefresh]);

    const handleMainMediaFailure = useCallback((item: MediaItem | null, reason: string) => {
        markMediaTemporarilyFailed(item, reason);
    }, [markMediaTemporarilyFailed]);

    const handleSideMediaFailure = useCallback((item: MediaItem | null, reason: string) => {
        markMediaTemporarilyFailed(item, reason);
    }, [markMediaTemporarilyFailed]);

    const playableItems = useMemo(() => {
        return allValidItems.filter(item => {
            const retryAt = failedUntilByUrl[item.url];
            return !retryAt || retryAt <= nowMs;
        });
    }, [allValidItems, failedUntilByUrl, nowMs]);

    // Separate content types for specific layout roles
    const videoItems = useMemo(() => playableItems.filter(i => isVideo(i.fileType)), [playableItems]);
    const imageItems = useMemo(() => playableItems.filter(i => !isVideo(i.fileType)), [playableItems]);

    // Layout flags
    const hasVideos = videoItems.length > 0;
    const hasImages = imageItems.length > 0;
    const isSingleVideo = hasVideos && videoItems.length === 1;
    const isEmpty = !hasVideos && !hasImages;

    // Derived Current Items - Main Pane
    const activeVideo = hasVideos ? videoItems[mainIndex % videoItems.length] : null;
    const activeMainImage = (!hasVideos && hasImages) ? imageItems[mainIndex % imageItems.length] : null;

    // Derived Current Items - Side Pane (Independent rotation)
    const rightTopImage = hasImages ? imageItems[sideIndex % imageItems.length] : null;
    const rightBottomImage = hasImages ? imageItems[(sideIndex + 1) % imageItems.length] : null;

    useEffect(() => {
        if (!hasVideos || !activeVideo?.url) {
            setIsMainVideoReady(false);
            return;
        }
        setIsMainVideoReady(false);
    }, [hasVideos, activeVideo?.url]);

    // Timer Logic 1: Main Content Rotation.
    // MODIFIED: Videos drive themselves via onEnded. Images use setTimeout.
    useEffect(() => {
        if (!isActive) return; // PAUSE TIMER IF NOT ACTIVE
        if (isEmpty) return;

        // If we are showing a video (because we have videos), we DO NOT start a timer.
        // The Video Element's onEnded event will trigger the next index.
        if (hasVideos && activeVideo) {
            return;
        }

        // If we are showing an image (because we have NO videos), we use the duration or default 10s.
        if (activeMainImage) {
            const duration = (activeMainImage.duration || 10) * 1000;
            const timer = setTimeout(() => {
                setMainIndex(prev => prev + 1);
            }, duration);
            return () => clearTimeout(timer);
        }

    }, [mainIndex, isEmpty, hasVideos, activeVideo, activeMainImage, isActive]);

    // Timer Logic 2: Side Images Rotation (Fixed Independent Duration)
    useEffect(() => {
        if (!isActive) return; // PAUSE TIMER IF NOT ACTIVE
        if (!hasImages) return;

        // Rotate side images every 8 seconds, completely independent of the video
        const sideTimer = setInterval(() => {
            setSideIndex(prev => prev + 2);
        }, MEDIA_ROTATE_IMAGE_S);

        return () => clearInterval(sideTimer);
    }, [hasImages, isActive]);

    // Video Playback Control based on Active State
    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                // Return to play if we became active
                const playPromise = videoRef.current.play();
                videoRef.current.disablePictureInPicture = true;
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            handleMainMediaFailure(activeVideo, error?.name || 'play-error');
                        }
                    });
                }
            } else {
                // Pause if we became inactive
                videoRef.current.pause();
            }
        }
    }, [isActive, activeVideo, handleMainMediaFailure]); // Check on active state change or video change

    useEffect(() => {
        const main = videoRef.current;
        const canvas = ambientCanvasRef.current;
        if (!main || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;

        const render = () => {
            if (main.readyState >= 2) {
                const vw = main.videoWidth || canvas.width;
                const vh = main.videoHeight || canvas.height;
                if (vw && vh && (canvas.width !== vw || canvas.height !== vh)) {
                    canvas.width = vw;
                    canvas.height = vh;
                }
                if (vw && vh) {
                    ctx.drawImage(main, 0, 0, canvas.width, canvas.height);
                }
            }
            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, [hasVideos, activeVideo?.url, isActive]);

    // Handler for Video End/Error to Ensure Rotation
    const handleNextMain = () => {
        setMainIndex(prev => prev + 1);
    };

    if (isEmpty) {
        if (playlist.place_holder?.url) {
            const isPlaceholderVideo = isVideo(playlist.place_holder.fileType);
            const canUsePlaceholder = !(videoOnly && !isPlaceholderVideo);

            if (!canUsePlaceholder || placeholderMediaFailed) {
                return FallBackPost(videoOnly);
            }

            return (
                <div className="absolute inset-0 bg-black h-full">
                    {/* Fullscreen Server Placeholder (Video or Image) */}
                    {isPlaceholderVideo ? (
                        <video
                            id="placeholder-video"
                            src={playlist.place_holder.url}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            disablePictureInPicture
                            disableRemotePlayback
                            playsInline
                            onError={() => setPlaceholderMediaFailed(true)}
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={playlist.place_holder.url}
                            alt="Placeholder"
                            className="object-cover w-full h-full"
                            onError={() => setPlaceholderMediaFailed(true)}
                        />
                    )}

                    {/* Standard Info Overlay (disabled for POS/video-only mode) */}
                    {!videoOnly && <InfoOverlay />}
                </div>
            )
        }

        return FallBackPost(videoOnly);
    }

    // 2. Fullscreen Modes (POS mode, or Check mode with only videos)
    if (videoOnly || (hasVideos && !hasImages)) {
        if (hasVideos) {
            return (
                <div className="absolute inset-0 bg-black overflow-hidden">
                    <canvas
                        ref={ambientCanvasRef}
                        className="absolute inset-0 w-full h-full object-cover scale-125"
                        style={{ filter: 'blur(80px)' }}
                        aria-hidden
                    />

                    <video
                        ref={videoRef}
                        src={activeVideo!.url}
                        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${isSingleVideo ? (isMainVideoReady ? 'opacity-100' : 'opacity-0') : 'opacity-100'}`}
                        autoPlay
                        muted
                        controls={false}
                        preload="auto"
                        disablePictureInPicture
                        disableRemotePlayback
                        loop={isSingleVideo}
                        playsInline
                        onLoadedData={() => setIsMainVideoReady(true)}
                        onEnded={isSingleVideo ? undefined : handleNextMain}
                        onError={() => handleMainMediaFailure(activeVideo, 'video-element')}
                    />
                    {!videoOnly && <InfoOverlay />}
                </div>
            );
        }

        if (videoOnly && hasImages) {
            return (
                <PosImageCarousel
                    image={activeMainImage!}
                    onError={() => handleMainMediaFailure(activeMainImage, 'image-element')}
                />
            );
        }
    }

    // 3. Mixed / Image Mode
    const mainContentUrl = hasVideos ? activeVideo!.url : activeMainImage!.url;
    const isMainContentVideo = hasVideos;

    // CRITICAL FIX: Removed 'key' props from video/img elements to encourage reuse.
    // This allows the browser to swap the 'src' attribute instantly without destroying the DOM component.
    // This eliminates flickering (black screens) during transitions.

    return (
        <div className="absolute inset-0 bg-black grid grid-cols-12 h-full">
            {/* Left Main Pane (8 cols) - No borders, full bleed */}
            <div className="col-span-8 relative h-full bg-black flex items-center justify-center p-0 overflow-hidden min-h-0 min-w-0">
                {isMainContentVideo ? (
                    <>
                        <canvas
                            ref={ambientCanvasRef}
                            className="absolute inset-0 w-full h-full object-cover scale-125"
                            style={{ filter: 'blur(25px)' }}
                            aria-hidden
                        />
                        <video
                            ref={videoRef}
                            src={mainContentUrl}
                            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${isSingleVideo ? (isMainVideoReady ? 'opacity-100' : 'opacity-0') : 'opacity-100'}`}
                            autoPlay
                            muted
                            controls={false}
                            preload="auto"
                            disablePictureInPicture
                            disableRemotePlayback
                            loop={isSingleVideo}
                            playsInline
                            onLoadedData={() => setIsMainVideoReady(true)}
                            onEnded={isSingleVideo ? undefined : handleNextMain}
                            onError={() => handleMainMediaFailure(activeVideo, 'video-element')}
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-black min-h-0 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={mainContentUrl}
                            alt="Main Content"
                            className="absolute inset-0 object-cover w-full h-full"
                            onError={() => handleMainMediaFailure(activeMainImage, 'image-element')}
                        />
                    </div>
                )}
            </div>

            {/* Right Side Pane (4 cols) - Split Top/Bottom - IMAGES ONLY */}
            <div className="col-span-4 grid grid-rows-2 h-full bg-black min-h-0 min-w-0">
                {/* Top Right Block */}
                <div className="relative border-b border-white/10 p-0 overflow-hidden bg-black min-h-0 min-w-0">
                    {rightTopImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={rightTopImage.url}
                            alt="Next 1"
                            className="absolute inset-0 object-fill w-full h-full"
                            onError={() => handleSideMediaFailure(rightTopImage, 'side-image-top')}
                        />
                    )}
                </div>

                {/* Bottom Right Block */}
                <div className="relative p-0 overflow-hidden bg-black min-h-0 min-w-0">
                    {rightBottomImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={rightBottomImage.url}
                            alt="Next 2"
                            className="absolute inset-0 object-fill w-full h-full"
                            onError={() => handleSideMediaFailure(rightBottomImage, 'side-image-bottom')}
                        />
                    )}
                </div>
            </div>

            {!videoOnly && <InfoOverlay />}
        </div>
    );
}
