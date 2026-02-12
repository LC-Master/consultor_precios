import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import '../globals.css';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Locatel TV Signage',
    description: 'Sistema de Cartelería Digital Locatel',
};

export default function TvLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={`${manrope.className} h-screen w-screen overflow-hidden bg-black text-white cursor-none select-none`}>
                {children}
            </body>
        </html>
    );
}
