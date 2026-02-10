'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { parseISO } from 'date-fns';
import InfoOverlay from './modals/InfoOverlay';
import { StandbyViewProps, MediaItem } from '@/types/index.type';

// Shared interfaces (matching ConsultorUI)


const isVideo = (fileType: string) => {
    return ['mp4'].includes(fileType.toLowerCase());
};



export default function StandbyView({ playlist, isActive = true }: StandbyViewProps) {
    const [allValidItems, setAllValidItems] = useState<MediaItem[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

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
                     const list = isAm ? campaign.am : campaign.pm;
                     if (list) {
                         sourceList.push(...list);
                     }
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
        const interval = setInterval(updateContent, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [playlist]);

    // Separate content types for specific layout roles
    const videoItems = useMemo(() => allValidItems.filter(i => isVideo(i.fileType)), [allValidItems]);
    const imageItems = useMemo(() => allValidItems.filter(i => !isVideo(i.fileType)), [allValidItems]);

    // Layout flags
    const hasVideos = videoItems.length > 0;
    const hasImages = imageItems.length > 0;
    const isEmpty = !hasVideos && !hasImages;

    // Derived Current Items - Main Pane
    const activeVideo = hasVideos ? videoItems[mainIndex % videoItems.length] : null;
    const activeMainImage = (!hasVideos && hasImages) ? imageItems[mainIndex % imageItems.length] : null;

    // Derived Current Items - Side Pane (Independent rotation)
    const rightTopImage = hasImages ? imageItems[sideIndex % imageItems.length] : null;
    const rightBottomImage = hasImages ? imageItems[(sideIndex + 1) % imageItems.length] : null;

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
            setSideIndex(prev => prev + 1);
        }, 8000);

        return () => clearInterval(sideTimer);
    }, [hasImages, isActive]);

    // Video Playback Control based on Active State
    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                // Return to play if we became active
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error("Resume/Play error:", error);
                        }
                    });
                }
            } else {
                // Pause if we became inactive
                videoRef.current.pause();
            }
        }
    }, [isActive, activeVideo]); // Check on active state change or video change

    // Handler for Video End/Error to Ensure Rotation
    const handleNextMain = () => {
        setMainIndex(prev => prev + 1);
    };

    // --- Render Logic ---

    // 1. Placeholder / Empty
    if (isEmpty) {
        if (playlist.place_holder?.url) {
            const isPlaceholderVideo = isVideo(playlist.place_holder.fileType);

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
                            playsInline
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={playlist.place_holder.url}
                            alt="Placeholder"
                            className="object-cover w-full h-full"
                        />
                    )}

                    {/* Standard Info Overlay */}
                    <InfoOverlay />
                </div>
            )
        }

        return null;
    }

    // 2. Video Only Mode
    if (hasVideos && !hasImages) {
        return (
            <div className="absolute inset-0 bg-black">
                <video
                    ref={videoRef}
                    src={activeVideo!.url}
                    className="w-full h-full object-cover"
                    muted
                    loop={false}
                    playsInline
                    onEnded={handleNextMain}
                    onError={handleNextMain}
                />
                <InfoOverlay />
            </div>
        );
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
            <div className="col-span-8 relative h-full bg-black flex items-center justify-center p-0 overflow-hidden">
                {isMainContentVideo ? (
                    <video
                        ref={videoRef}
                        src={mainContentUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop={false}
                        playsInline
                        onEnded={handleNextMain}
                        onError={handleNextMain}
                    />
                ) : (
                    <div className="relative w-full h-full bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={mainContentUrl}
                            alt="Main Content"
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}
            </div>

            {/* Right Side Pane (4 cols) - Split Top/Bottom - IMAGES ONLY */}
            <div className="col-span-4 grid grid-rows-2 h-full bg-black">
                {/* Top Right Block */}
                <div className="relative border-b border-white/10 p-0 overflow-hidden bg-black">
                    {rightTopImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={rightTopImage.url}
                            alt="Next 1"
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>

                {/* Bottom Right Block */}
                <div className="relative p-0 overflow-hidden bg-black">
                    {rightBottomImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={rightBottomImage.url}
                            alt="Next 2"
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>
            </div>

            <InfoOverlay />
        </div>
    );
}
