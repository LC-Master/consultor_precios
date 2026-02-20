import Image from "next/image";

export default function InfoOverlay() {
    return (
        <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div className="relative bg-locatel-fuerte/98 backdrop-blur-md border-2 border-locatel-medio/60 px-14 py-6 rounded-[2rem] shadow-2xl shadow-black/40 flex items-center gap-6 transition-all duration-300 max-w-3xl mx-auto">
                <div className="absolute -inset-1 rounded-[1.9rem] border border-locatel-medio/35 animate-pulse"></div>
                <Image
                    width={56}
                    height={56}
                    priority={true}
                    src="/logo.webp"
                    alt="Logo"
                    className="object-contain drop-shadow-md relative z-10"
                />
                <div className="flex flex-col items-start justify-center -space-y-0.5 relative z-10">
                    <p className="text-white text-sm font-black tracking-[0.24em] uppercase">Escanee Aquí</p>
                    <p className="text-white text-3xl md:text-4xl font-black tracking-widest uppercase drop-shadow-xl leading-tight">
                        Consulte Aquí
                    </p>
                </div>
            </div>
        </div>
    );
}