export default function Header() {
    return (
        <header className="bg-[#007a36] text-white p-4 shadow-md flex justify-between items-center shrink-0 z-10">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <rect width="10" height="6" x="7" y="9" rx="1" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight leading-none">LOCATEL</h1>
                    <p className="text-xs opacity-80 font-medium">Consultor de Precios</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
            </div>
        </header>
    );
}