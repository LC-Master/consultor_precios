'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { StandbyViewProps, MediaItem } from '@/types/index.type';

const isVideo = (fileType: string) => {
    return ['mp4'].includes(fileType.toLowerCase());
};

const TvWatermark = () => (
    <div className="absolute top-8 left-10 z-30">
        <div className="flex items-center gap-5 rounded-2xl bg-white/90 p-5 shadow-2xl backdrop-blur-md border border-white/20">
            <Image
                width={140}
                height={50}
                src="/logo.webp"
                alt="Locatel"
                className="h-10 w-auto object-contain drop-shadow-md"
            />
            <div className="h-8 w-px bg-emerald-800/20" />
            <span className="text-emerald-900/90 font-medium tracking-widest uppercase text-sm">Bienestar</span>
        </div>
    </div>
);

export default function TvPlayer({ playlist, isActive = true }: StandbyViewProps) {
    const [allValidItems, setAllValidItems] = useState<MediaItem[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [mainIndex, setMainIndex] = useState(0);
    const [sideIndex, setSideIndex] = useState(0);
    const [now, setNow] = useState(() => new Date());

    // Filter Logic
    useEffect(() => {
        const updateContent = () => {
            const now = new Date();
            const hour = now.getHours();
            const isAm = hour < 12;

            const sourceList: MediaItem[] = [];
            if (playlist.campaigns) {
                playlist.campaigns.forEach(campaign => {
                    const list = isAm ? campaign.am : campaign.pm;
                    if (list) {
                        sourceList.push(...list);
                    }
                });
            }

            const validItems = sourceList.filter(item => {
                if (item.start_at && item.end_at) {
                    const start = parseISO(item.start_at);
                    const end = parseISO(item.end_at);
                    return now >= start && now <= end;
                }
                return true;
            });

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
        const interval = setInterval(updateContent, 60000);
        return () => clearInterval(interval);
    }, [playlist]);

    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const videoItems = useMemo(() => allValidItems.filter(i => isVideo(i.fileType)), [allValidItems]);
    const imageItems = useMemo(() => allValidItems.filter(i => !isVideo(i.fileType)), [allValidItems]);

    const hasVideos = videoItems.length > 0;
    const hasImages = imageItems.length > 0;
    const isEmpty = !hasVideos && !hasImages;

    const activeVideo = hasVideos ? videoItems[mainIndex % videoItems.length] : null;
    const activeMainImage = (!hasVideos && hasImages) ? imageItems[mainIndex % imageItems.length] : null;

    const rightTopImage = hasImages ? imageItems[sideIndex % imageItems.length] : null;
    const rightBottomImage = hasImages ? imageItems[(sideIndex + 1) % imageItems.length] : null;

    useEffect(() => {
        (async () => {
            setMainIndex(0);
            setSideIndex(0);
        })()
    }, [videoItems.length, imageItems.length]);

    // Rotation Logic - Main Pane
    useEffect(() => {
        if (!isActive) return;
        if (isEmpty) return;

        if (hasVideos && activeVideo) {
            return; // Driven by onEnded
        }

        if (activeMainImage) {
            const duration = (activeMainImage.duration || 10) * 1000;
            const timer = setTimeout(() => {
                setMainIndex(prev => prev + 1);
            }, duration);
            return () => clearTimeout(timer);
        }

    }, [mainIndex, isEmpty, hasVideos, activeVideo, activeMainImage, isActive]);

    // Rotation Logic - Side Pane
    useEffect(() => {
        if (!isActive) return;
        if (!hasImages) return;

        const sideTimer = setInterval(() => {
            setSideIndex(prev => prev + 1);
        }, 8000);

        return () => clearInterval(sideTimer);
    }, [hasImages, isActive]);

    // Video Playback Control
    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isActive, activeVideo]);

    const handleNextMain = () => {
        setMainIndex(prev => prev + 1);
    };

    const formattedTime = useMemo(() => format(now, 'h:mm a'), [now]);
    const formattedDate = useMemo(() => {
        const label = format(now, "EEEE d 'de' MMMM", { locale: es });
        return label.charAt(0).toUpperCase() + label.slice(1);
    }, [now]);

    if (isEmpty) {
        if (playlist.place_holder?.url) {
            const isPlaceholderVideo = isVideo(playlist.place_holder.fileType);
            return (
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-locatel-oscuro">
                    {isPlaceholderVideo ? (
                        <video
                            src={playlist.place_holder.url}
                            className="h-full w-full object-cover opacity-90"
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
                            className="h-full w-full object-cover opacity-90"
                        />
                    )}
                    <TvWatermark />
                </div>
            )
        }
        return (
            <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-locatel-oscuro">
                <Image width={200} height={80} src="/logo.webp" alt="Locatel" className="z-10 opacity-80" />
            </div>
        );
    }

    const mainContentUrl = hasVideos ? activeVideo!.url : activeMainImage!.url;
    const isMainContentVideo = hasVideos;
    const showSidePanel = hasImages;

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-linear-to-br from-oscuro via-locatel-medio to-[#005c40] text-white p-8">

            {/* Background Texture Element */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-locatel-claro opacity-20 blur-[120px] rounded-full pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-100 h-100 bg-locatel-medio opacity-20 blur-[100px] rounded-full pointer-events-none -ml-20 -mb-20"></div>

            {/* Header Area */}
            <div className="relative z-20 flex justify-between items-center mb-6 pl-2 pr-4">
                <div className="flex items-center gap-6">
                    <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm">
                        <Image
                            width={160}
                            height={60}
                            src="/logo.webp"
                            alt="Locatel"
                            className="h-10 w-auto object-contain"
                        />
                    </div>
                    <div className="h-6 w-px bg-white/30"></div>
                    <span className="text-white/90 font-light tracking-[0.2em] uppercase text-sm drop-shadow-sm">Cartelería Digital</span>
                </div>

                <div className="flex flex-col items-end text-shadow-sm">
                    <div className="text-5xl font-bold tracking-tight leading-none drop-shadow-md">{formattedTime}</div>
                    <div className="text-base font-medium opacity-90 uppercase tracking-widest mt-1 drop-shadow-sm">{formattedDate}</div>
                </div>
            </div>

            {/* Content Grid */}
            <div className={`relative z-10 grid min-h-0 flex-1 gap-8 ${showSidePanel ? 'grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>

                {/* Main Content Card */}
                <div className="relative h-full w-full overflow-hidden rounded-3xl bg-black shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-white/10 group">
                    {isMainContentVideo ? (
                        <video
                            ref={videoRef}
                            src={mainContentUrl}
                            className="h-full w-full object-contain bg-black"
                            muted
                            loop={false}
                            playsInline
                            onEnded={handleNextMain}
                            onError={handleNextMain}
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={mainContentUrl}
                            alt="Contenido principal"
                            className="h-full w-full object-contain bg-black"
                        />
                    )}
                </div>

                {/* Sidebar - Only if showSidePanel */}
                {showSidePanel && (
                    <div className="flex flex-col gap-6 h-full">
                        {/* Side Card 1 */}
                        <div className="relative flex-1 overflow-hidden rounded-3xl bg-white border border-white/20 shadow-xl">
                            {rightTopImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={rightTopImage.url}
                                    alt="Side 1"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gray-50">
                                    <span className="text-emerald-800/20 text-4xl mb-2">✦</span>
                                </div>
                            )}
                        </div>

                        {/* Side Card 2 */}
                        <div className="relative flex-1 overflow-hidden rounded-3xl bg-white border border-white/20 shadow-xl">
                            {rightBottomImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={rightBottomImage.url}
                                    alt="Side 2"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gray-50">
                                    <span className="text-emerald-800/20 text-4xl mb-2">✦</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
