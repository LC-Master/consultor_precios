import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="h-full w-full bg-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Consultor de Precios</h1>
        <p className="mt-3 text-slate-500">Selecciona el modo que deseas abrir.</p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <Link
            href="/check"
            className="w-full rounded-2xl bg-locatel-medio px-5 py-4 text-center text-white font-bold text-lg shadow-md hover:bg-locatel-oscuro transition-colors"
          >
            Ir a Consulta
          </Link>

          <Link
            href="/pos"
            className="w-full rounded-2xl bg-black px-5 py-4 text-center text-white font-bold text-lg shadow-md hover:bg-slate-900 transition-colors"
          >
            Ir a Caja 
          </Link>
        </div>
      </section>
    </main>
  );
}
