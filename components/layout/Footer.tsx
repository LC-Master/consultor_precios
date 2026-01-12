import { Barcode } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-locatel-medio text-gray-800 p-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-white backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
          <div className="p-2 rounded-md bg-gray-200 text-emerald-700">
            <Barcode className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="block font-semibold uppercase text-sm">Escanea otro producto</span>
            <span className="block text-xs text-gray-500">en cualquier momento</span>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl flex flex-col md:flex-row items-center gap-3 text-sm">
          <p className="text-black">© {new Date().getFullYear()} LOCATEL. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}