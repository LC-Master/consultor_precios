'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Clock = dynamic(() => import('../ui/Clock'), { ssr: false });

export default function Header() {
    return (
        <header className="p-3 bg-locatel-medio shadow-md w-full flex justify-between items-center">
            <div className="flex bg-white p-2 rounded-lg items-center gap-3">
                <div className="bg-gray-200 p-2 rounded-lg">
                    <Image src="/logo.webp" alt="Locatel Logo" width={34} height={34} />
                </div>
                <div className="">
                    <h1 className="text-lg font-bold tracking-tight leading-none">LOCATEL</h1>
                    <p className="text-[11px] opacity-80 font-medium">Consultor de Precios</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="flex bg-white rounded-2xl p-2 items-center">
                    <Clock />
                </span>
            </div>
        </header>
    );
}
