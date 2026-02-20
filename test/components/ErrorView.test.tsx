import { describe, expect, it, vi } from "bun:test";
import { createRef } from "react";
import { render, screen, act } from "@testing-library/react";
import ErrorView from "@/components/ErrorView";

describe("ErrorView", () => {
    const noop = () => { };

    it("should render the default message when none is provided", () => {
        render(<ErrorView onClose={noop} inputRef={createRef()} />);

        expect(screen.getByText("El producto consultado no se encuentra en sistema.")).toBeDefined();
        expect(screen.getByText("No encontrado")).toBeDefined();
    });

    it("should render a custom message", () => {
        render(<ErrorView message="Producto temporalmente agotado" onClose={noop} inputRef={createRef()} />);

        expect(screen.getByText("Producto temporalmente agotado")).toBeDefined();
    });

    it("should call onClose and refocus input after timeout", async () => {
        const onClose = vi.fn();
        const inputRef = createRef<HTMLInputElement>();

        // Create a focus spy
        const fakeInput = { focus: vi.fn() } as unknown as HTMLInputElement;
        inputRef.current = fakeInput;

        // Use fake timers to avoid waiting 3s
        vi.useFakeTimers();

        render(<ErrorView onClose={onClose} inputRef={inputRef} />);

        // Fast-forward timers
        await act(async () => {
            vi.runAllTimers();
        });

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(fakeInput.focus).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });
});
