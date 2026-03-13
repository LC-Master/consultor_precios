import type { Metadata } from 'next';
import FullscreenVideosUI from '@/components/ui/FullscreenVideosUI';

export const metadata: Metadata = {
  title: 'Modo Caja - Consultor de Precios',
  description: 'Modo de pantalla completa para mostrar videos en el POS.',
};

export default function FullscreenPage() {
  return <FullscreenVideosUI />;
}
