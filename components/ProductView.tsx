import { Product } from "@/types/product.type";

export default function ProductView({ product }: { product: Product }) {
    return (
        <div className="flex-1 overflow-y-auto bg-black p-4 lg:p-6 items-center justify-center h-1/2 w-1/2 rounded animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-4">Detalles del Producto</h2>
        </div>
    )
};