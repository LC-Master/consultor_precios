import type { Metadata } from "next";
import "./globals.css";
import Body from "@/components/layout/Body";
const APP_TITLE = "Consultor de Precios Locatel";
const APP_DESCRIPTION = "Aplicación de consulta de precios para Locatel";


export const metadata: Metadata = {
  applicationName: "Consultor de Precios Locatel",
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_TITLE}`,
  },
  description: APP_DESCRIPTION,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <Body>{children}</Body>
    </html>
  );
}
