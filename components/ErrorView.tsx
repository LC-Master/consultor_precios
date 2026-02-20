'use client';
import { useEffect } from "react";

interface ErrorViewProps {
    message?: string;
    onClose: () => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function ErrorView({ message, onClose, inputRef }: ErrorViewProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
            inputRef?.current?.focus();
        }, 3000); 
        return () => clearTimeout(timer);
    }, [onClose, inputRef]);

    return (
        <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={(e) => {
                e.stopPropagation();
                inputRef?.current?.focus();
            }}
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-12 max-w-md w-full text-center space-y-6 border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-2 ring-10 ring-red-50/50">
                     <span className="material-icons text-5xl text-red-500">priority_high</span>
                </div>
                <div>
                   <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
                     No encontrado
                   </h3>
                   <p className="text-lg text-slate-500 font-medium leading-relaxed">
                     {message || "El producto consultado no se encuentra en sistema."}
                   </p>
                </div>
            </div>
        </div>
    );
}
