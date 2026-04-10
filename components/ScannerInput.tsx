import { Input } from "@/components/ui/Input";
import { RefObject, ChangeEvent, KeyboardEvent, useEffect } from "react";

interface ScannerInputProps {
    inputRef: RefObject<HTMLInputElement | null>;
    code: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onEnter: () => void;
}

export function ScannerInput({ inputRef, code, onChange, onEnter }: ScannerInputProps) {
    useEffect(() => {
        const focusInput = () => inputRef.current?.focus();
        focusInput();
        const timeoutId = setTimeout(focusInput, 0);

        return () => clearTimeout(timeoutId);
    }, [inputRef]);

    return (
        <div className="fixed inset-0 z-40 opacity-0 w-0 h-0 overflow-hidden pointer-events-none">
            <Input
                ref={inputRef as RefObject<HTMLInputElement>}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                value={code}
                onChange={onChange}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") onEnter();
                }}
                onBlur={() => {
                    setTimeout(() => inputRef.current?.focus(), 10);
                }}
                className="w-full h-full"
            />
        </div>
    );
}
