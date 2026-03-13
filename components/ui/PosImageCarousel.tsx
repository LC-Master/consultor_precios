import { MediaItem } from "@/types/index.type";

interface PosImageCarouselProps {
    image: MediaItem;
    onError: () => void;
}

export default function PosImageCarousel({ image, onError }: PosImageCarouselProps) {
    return (
        <div className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center p-0 min-h-0 min-w-0">
            {/* Ambient Background (optional, matches video player style) */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 scale-125 blur-3xl"
                style={{ backgroundImage: `url(${image.url})` }}
                aria-hidden
            />
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={image.url}
                alt="POS Image Carousel"
                className="relative z-10 w-full h-full object-contain"
                onError={onError}
            />
        </div>
    );
}
