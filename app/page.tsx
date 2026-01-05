import { Metadata } from "next";
import ConsultorUI from "./ConsultorUI";

export const metadata: Metadata = {
  title: 'Consultor de Precios LOCATEL',
  description: 'Aplicación para consultar precios de artículos en LOCATEL',
  
};
export default function HomePage() {
  return (
    <ConsultorUI />
  );
}
