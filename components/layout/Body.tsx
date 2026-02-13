'use client';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SerwistProvider } from "@serwist/next/react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function Body({ children }: { children: React.ReactNode }) {
    return (
        <body
            className={`${geistSans.variable} ${geistMono.variable} bg-slate-100 antialiased min-h-screen flex flex-col overflow-hidden`}
        >
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <SerwistProvider swUrl="/serwist/sw.js">
                <Header />
                <div className="flex-1 min-h-0 overflow-hidden">
                    {children}
                </div>
                <Footer />
            </SerwistProvider>
        </body>
    )
}