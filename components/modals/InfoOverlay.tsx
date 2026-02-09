import Image from "next/image";

export default function InfoOverlay() {
    return (
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div className="bg-locatel-fuerte/90 backdrop-blur-md border-2 border-white/30 px-10 py-4 rounded-2xl shadow-2xl flex items-center gap-4 transform hover:scale-105 transition-transform duration-500">
                <Image
                    width={40}
                    height={40}
                    priority={true}
                    src="/logo.webp"
                    alt="Logo"
                    className="object-contain drop-shadow-md"
                />
                <div className="flex flex-col items-start justify-center -space-y-1">
                    <p className="text-white text-xs font-bold tracking-[0.2em] uppercase opacity-80">Sistema</p>
                    <p className="text-white text-xl font-black tracking-widest uppercase drop-shadow-lg">
                        Consultor de Precios
                    </p>
                </div>
            </div>
        </div>
    );
}