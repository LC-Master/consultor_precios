'use client'

import React, { useState, type ChangeEvent } from "react";
import { consultarArticulo } from "./actions/consultar-articulo";
type Product = {
  Bloqueado: boolean;
  CodArticulo: number;
  CodBarra: number;
  Descripcion: string;
  Iva: number;
  NomProm: string;
  PorcDesc: number;
  PrecioBase: number;
  PrecioBaseProm: number;
  PrecioIVAProm: number;
  PrecioIva: number;
  PrecioRef: number;
  PrecioRefProm: number;
  Tasa: number;
  TasaEuro: number;
}

export default function ConsultorUI() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const handlerCode = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  }

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setProduct(null);
    try {
      const result = await consultarArticulo(code);
      setProduct(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  const Header = () => (
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

  const ProductView = ({ p }: { p: Product }) => (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                  Cod: {p.CodArticulo}
                </span>
                {p.Bloqueado && (
                  <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
                    Producto Bloqueado
                  </span>
                )}
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
                {p.Descripcion}
              </h2>

              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Precio Público</span>
                  <span className="text-5xl sm:text-6xl font-extrabold text-[#007a36] tracking-tight">
                    {p.PrecioIva}
                  </span>
                </div>

                {p.PorcDesc > 0 && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide line-through">Antes</span>
                    <span className="text-3xl font-semibold text-slate-400 line-through decoration-2">
                      {p.PrecioRef}
                    </span>
                  </div>
                )}
              </div>

              {p.PorcDesc > 0 && (
                <div className="mt-6 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5L5 19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
                  Ahorras {p.PorcDesc}
                </div>
              )}
            </div>

            {p.NomProm && (
              <div className="bg-[#007a36]/5 border-t border-[#007a36]/10 p-4 flex items-center gap-3">
                <div className="bg-[#007a36] text-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0l-2.33 1.26-2.32-1.26a1.93 1.93 0 0 0-1.81 0L.26 8.84a1.93 1.93 0 0 0 0 1.79l1.58 2.9-1.58 2.9a1.93 1.93 0 0 0 0 1.79l6.25 3.42a1.93 1.93 0 0 0 1.81 0l2.32-1.26 2.33 1.26a1.93 1.93 0 0 0 1.81 0l6.25-3.42a1.93 1.93 0 0 0 0-1.79l-1.58-2.9 1.58-2.9a1.93 1.93 0 0 0 0-1.79Z" /></svg>
                </div>
                <span className="font-medium text-[#007a36]">{p.NomProm}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PriceCard label="Precio Base" value={p.PrecioBase} />
            <PriceCard label="Precio Base Promo" value={p.PrecioBaseProm} highlight={p.PrecioBaseProm < p.PrecioBase} />
            <PriceCard label="Precio IVA Promo" value={p.PrecioIVAProm} highlight={p.PrecioIVAProm < p.PrecioIva} />
            <PriceCard label="Precio Ref Promo" value={p.PrecioRefProm} />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              Detalles Técnicos
            </h3>
            <div className="space-y-4">
              <DetailRow label="Código de Barra" value={p.CodBarra} />
              <DetailRow label="Tasa IVA" value={p.Iva} />
              <DetailRow label="Tasa Cambio" value={p.Tasa} />
              <DetailRow label="Tasa Euro" value={p.TasaEuro} />
            </div>
          </div>

          <div className="bg-[#007a36] rounded-2xl shadow-sm p-6 text-white mt-auto">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="10" height="6" x="7" y="9" rx="1" /></svg>
              </div>
              <div>
                <p className="font-bold text-lg">¿Consultar otro?</p>
                <p className="text-white/80 text-sm">Escanea el siguiente producto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PriceCard = ({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) => (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-green-50 border-green-100' : 'bg-white border-slate-200'}`}>
      <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${highlight ? 'text-green-700' : 'text-slate-500'}`}>{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-green-800' : 'text-slate-900'}`}>{value}</div>
    </div>
  );

  const DetailRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );

  return (
    <main className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header />
      <input
        type="text"
        className="text-black w-16"
        value={code}
        onChange={handlerCode}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
      />
      <button type="button" onClick={handleSearch}>buscar</button>
      {product && <ProductView p={product} />}
    </main>
  );
}
