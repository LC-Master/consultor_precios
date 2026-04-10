'use client';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import useAppStore from "@/store/useAppStore";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function Body({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        void useAppStore.getState().loadFromEnv();
    }, []);

    return (
        <body
            className={`${geistSans.variable} ${geistMono.variable} bg-slate-100 antialiased min-h-screen flex flex-col overflow-hidden`}
        >
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <Header />
            <div className="flex-1 min-h-0 overflow-hidden">
                {children}
            </div>
            <Footer />
        </body>
    )
}