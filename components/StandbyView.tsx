'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
// import Image from 'next/image';

// Shared interfaces (matching ConsultorUI)
export interface MediaItem {
    id: string;
    fileType: string;
    url: string;
    start_at: string; // ISO Date String
    end_at: string;   // ISO Date String
    duration?: number;
    position?: number;
}

export interface PlaylistData {
    am: MediaItem[];
    pm: MediaItem[];
    place_holder?: { id: string; fileType: string; url?: string };
}

interface StandbyViewProps {
    playlist: PlaylistData;
    isActive?: boolean;
}

const isVideo = (fileType: string) => {
    return ['mp4', 'webm', 'ogg', 'mov'].includes(fileType.toLowerCase());
};

const InfoOverlay = () => (
    <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="bg-locatel-fuerte/90 backdrop-blur-md border-2 border-white/30 px-10 py-4 rounded-2xl shadow-2xl flex items-center gap-4 transform hover:scale-105 transition-transform duration-500">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.8)]"></span>
            <div className="flex flex-col items-start justify-center -space-y-1">
                <p className="text-white text-xs font-bold tracking-[0.2em] uppercase opacity-80">Sistema</p>
                <p className="text-white text-xl font-black tracking-widest uppercase drop-shadow-lg">
                    Consultor de Precios
                </p>
            </div>
        </div>
    </div>
);

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

            const sourceList = isAm ? playlist.am : playlist.pm;
            
            // Filter by Date Range validity (ISO Strings)
            const validItems = sourceList.filter(item => {
                if (item.start_at && item.end_at) {
                    const start = new Date(item.start_at);
                    const end = new Date(item.end_at);
                    return now >= start && now <= end;
                }
                return true;
            });

            // If list has changed, update.
            setAllValidItems(prev => {
                 if (prev.length !== validItems.length) return validItems;
                 let changed = false;
                 for (let i = 0; i < prev.length; i++) {
                     if (prev[i].id !== validItems[i].id) {
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
                videoRef.current.play().catch(e => console.error("Resume/Play error:", e));
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

    if (isEmpty) {
        if (playlist.place_holder?.url) {
            return (
                <div className="absolute inset-0 bg-white grid grid-cols-12 h-full animate-in fade-in duration-1000">
                    {/* Left Main Pane with Server Placeholder */}
                    <div className="col-span-8 relative h-full bg-slate-50 flex items-center justify-center p-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={playlist.place_holder.url} alt="Placeholder" className="object-cover w-full h-full opacity-50" />
                        
                        {/* Overlay Text forced by user requirement */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-locatel-medio animate-pulse">
                            <span className="material-icons text-9xl">shopping_cart</span>
                            <h1 className="text-4xl font-bold mt-4 uppercase tracking-widest text-slate-400">Consulta Aquí</h1>
                            <p className="mt-2 text-xl font-light text-slate-400">Escanea tu producto</p>
                        </div>
                    </div>

                    {/* Right Side Pane */}
                    <div className="col-span-4 grid grid-rows-2 h-full">
                        <div className="relative border-b border-white p-0 overflow-hidden bg-slate-50 flex items-center justify-center">
                            <span className="material-icons text-8xl text-slate-200 animate-pulse">touch_app</span>
                        </div>
                        <div className="relative p-0 overflow-hidden bg-slate-50 flex items-center justify-center">
                            <span className="material-icons text-8xl text-slate-200 animate-pulse">shopping_bag</span>
                        </div>
                    </div>
                </div>
            )
        }
        
        // If honestly empty (no server placeholder, no content), render NOTHING here.
        // The ConsultorUI input will take over the visibility.
        return null; 
    }

    // CASE: Video Only (Strictly no images) -> Fullscreen Video
    if (hasVideos && !hasImages) {
         return (
            <div key={activeVideo!.id} className="absolute inset-0 bg-black animate-in fade-in duration-1000">
                <video 
                    ref={videoRef}
                    src={activeVideo!.url} 
                    className="w-full h-full object-cover" 
                    autoPlay 
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

    // CASE: Mixed Layout (Video/Main Left + Images Right)
    // OR Image Only Layout (Image Left + Images Right)
    const mainContentUrl = hasVideos ? activeVideo!.url : activeMainImage!.url;
    const isMainContentVideo = hasVideos;
    
    // For the main key, use the ID of the playing item to force re-render/animate on change
    const mainKey = hasVideos ? activeVideo!.id : activeMainImage!.id;

    return (
        <div className="absolute inset-0 bg-white grid grid-cols-12 h-full animate-in fade-in duration-1000">
            {/* Left Main Pane (8 cols) - No borders, full bleed */}
            <div key={mainKey} className="col-span-8 relative h-full bg-slate-50 flex items-center justify-center p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                {isMainContentVideo ? (
                     <video 
                        ref={videoRef}
                        src={mainContentUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        muted 
                        loop={false}
                        playsInline
                        onEnded={handleNextMain}
                        onError={handleNextMain}
                    />
                ) : (
                    <div className="relative w-full h-full">
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
            <div className="col-span-4 grid grid-rows-2 h-full">
                {/* Top Right Block */}
                <div className="relative border-b border-white p-0 overflow-hidden">
                     {rightTopImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            key={`top-${rightTopImage.id}`}
                            src={rightTopImage.url} 
                            alt="Next 1" 
                            className="object-cover w-full h-full animate-in slide-in-from-right-8 duration-700"
                        />
                     )}
                </div>
                
                {/* Bottom Right Block */}
                <div className="relative p-0 overflow-hidden">
                     {rightBottomImage && (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img 
                             key={`bottom-${rightBottomImage.id}`}
                             src={rightBottomImage.url} 
                             alt="Next 2" 
                             className="object-cover w-full h-full animate-in slide-in-from-right-8 duration-1000"
                         />
                     )}
                </div>
            </div>
            
            <InfoOverlay />
        </div>
    );
}
