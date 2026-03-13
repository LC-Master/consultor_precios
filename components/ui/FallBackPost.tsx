import InfoOverlay from "@/components/modals/InfoOverlay";
import Image from 'next/image';

export default function FallBackPost(videoOnly: boolean) {
    return (
        <div className="h-full w-full bg-[#f8fdf9]">
            {!videoOnly && <InfoOverlay />}
            {videoOnly && (
                <div className="relative flex h-full w-full flex-col overflow-hidden font-sans z-0">
                    {/* Grid Background */}
                    <div className="absolute inset-0 -z-10 opacity-70 bg-[linear-gradient(90deg,#e4eee8_1px,transparent_1px),linear-gradient(180deg,#e4eee8_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none" />

                    {/* Bottom Left Glow */}
                    <div className="h-[70%] w-[70%] rounded-full bg-locatel-medio/15 blur-[120px] pointer-events-none hidden" />

                    <header className="w-full bg-locatel-medio h-16 shrink-0" />

                    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 text-center">
                        {/* Logo Box */}
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-4xl border border-slate-50 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                            <Image src="/logo.webp" alt="Locatel Logo" width={56} height={56} priority className="object-contain" />
                        </div>

                        {/* Store Name */}
                        <h2 className="mb-4 flex items-center gap-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                            Punto de <span className="text-locatel-medio">Caja</span>
                        </h2>

                        {/* Status Pill */}
                        <div className="mb-8 flex items-center gap-2 rounded-full border border-locatel-claro/20 bg-[#ebf5ed] px-4 py-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#047857]">Disponible</span>
                        </div>

                        {/* Welcome */}
                        <h1 className="mb-4 text-5xl sm:text-6xl font-black tracking-tight text-[#111827]">
                            ¡Bienvenidos!
                        </h1>

                        {/* Subtext */}
                        <p className="mb-8 max-w-xl text-base sm:text-xl leading-relaxed text-[#64748b]">
                            Por favor, acérquese a la caja para ser atendido.<br /> Estamos listos para ayudarle.
                        </p>

                        {/* Bottom Card */}
                        <div className="flex w-full max-w-md items-center gap-5 rounded-3xl border border-slate-100 bg-white/80 p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] backdrop-blur-md">
                            <div className="flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-2xl bg-locatel-medio text-white shadow-inner">
                                <span className="material-icons text-[28px]">shopping_basket</span>
                            </div>
                            <div className="flex flex-col text-left">
                                <h3 className="mb-0.5 text-[17px] font-bold text-[#111827]">Gracias por su visita</h3>
                                <p className="text-[14px] text-[#64748b]">Entregue sus productos al personal</p>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </div>
    )
}