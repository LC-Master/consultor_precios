export default function Loading() {
    return (
        <main className="h-full w-full flex flex-col gap-3 items-center justify-center bg-slate-100 overflow-hidden">
            <span className="border-4 border-locatel-medio w-15 h-15 rounded-full border-b-transparent animate-spin" />
            <div className="text-slate-600 animate-pulse">Cargando...</div>
        </main>
    )
}