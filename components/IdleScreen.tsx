interface IdleScreenProps {
    hidden?: boolean;
}

export function IdleScreen({ hidden = false }: IdleScreenProps) {
    return (
        <div className={`relative z-10 w-full flex-1 flex flex-col items-center justify-center transition-all duration-300 ${hidden ? 'opacity-0' : 'opacity-100'}`}>
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-xl animate-in fade-in zoom-in duration-500">
                <div className="bg-locatel-medio/10 p-6 rounded-full mb-6 animate-pulse">
                    <span className="material-icons text-8xl text-locatel-medio">qr_code_scanner</span>
                </div>
                <h1 className="text-5xl font-black text-slate-800 tracking-widest uppercase mb-4">Consulta Aquí</h1>
                <div className="h-1 w-24 bg-locatel-medio rounded-full mb-4"></div>
                <p className="text-slate-400 text-xl font-medium">Escanea el código de barras de tu producto</p>
            </div>
        </div>
    );
}
