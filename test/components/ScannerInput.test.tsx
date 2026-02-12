import { describe, expect, it } from "bun:test";
import { createRef, type ChangeEvent } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScannerInput } from "@/components/ScannerInput";

describe("ScannerInput", () => {
    it("should wire value and handlers to the underlying input", () => {
        const inputRef = createRef<HTMLInputElement>();
        let changeEventReceived = "";
        let enterCount = 0;

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            changeEventReceived = e.target.value;
        };

        const handleEnter = () => {
            enterCount += 1;
        };

        render(
            <ScannerInput 
                inputRef={inputRef}
                code="7591440409094"
                onChange={handleChange}
                onEnter={handleEnter}
            />
        );

        const input = screen.getByDisplayValue("7591440409094");
        expect(input).toBeDefined();

        // Simulate change
        fireEvent.change(input, { target: { value: "123" } });
        expect(changeEventReceived).toBe("123");

        // Simulate enter key
        fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });
        expect(enterCount).toBe(1);

        // Simulate other key (should not trigger onEnter)
        fireEvent.keyDown(input, { key: "Escape", code: "Escape", charCode: 27 });
        expect(enterCount).toBe(1);
    });

    it("should refocus input on blur", async () => {
        const inputRef = createRef<HTMLInputElement>();
        
        render(
            <ScannerInput 
                inputRef={inputRef}
                code=""
                onChange={() => {}}
                onEnter={() => {}}
            />
        );

            const input = screen.getByDisplayValue("") as HTMLInputElement;
        
        // Mock focus method to verify call
        let focusCalled = false;
        const originalFocus = input.focus;
        input.focus = () => {
             focusCalled = true;
             // Call original if needed, but for test mere flag update is enough
        };

        fireEvent.blur(input);

        // Wait for setTimeout(..., 10) in component
        await new Promise(resolve => setTimeout(resolve, 50));
        
        expect(focusCalled).toBe(true);
        
        // Restore
        input.focus = originalFocus;
    });
});
