import Image from "next/image";

export default function InfoOverlay() {
    return (
        <div className="absolute bottom-8 sm:bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div className="relative bg-locatel-fuerte/98 backdrop-blur-md border-2 border-locatel-medio/60 px-6 py-4 sm:px-10 sm:py-5 md:px-14 md:py-6 rounded-3xl sm:rounded-[1.75rem] md:rounded-4xl shadow-2xl shadow-black/40 flex items-center gap-4 sm:gap-5 md:gap-6 transition-all duration-300 max-w-[95vw] sm:max-w-3xl mx-auto">
                <div className="absolute -inset-1 rounded-[1.9rem] border border-locatel-medio/35 animate-pulse"></div>
                <Image
                    width={48}
                    height={48}
                    priority={true}
                    src="/logo.webp"
                    alt="Logo"
                    className="object-contain drop-shadow-md relative z-10"
                />
                <div className="flex flex-col items-start justify-center -space-y-0.5 relative z-10">
                    <p className="text-white text-xs sm:text-sm font-black tracking-[0.24em] uppercase">Escanee Aquí</p>
                    <p className="text-white text-2xl sm:text-3xl md:text-4xl font-black tracking-widest uppercase drop-shadow-xl leading-tight">
                        Consulte Aquí
                    </p>
                </div>
            </div>
        </div>
    );
}