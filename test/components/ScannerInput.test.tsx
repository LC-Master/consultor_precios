import { describe, expect, it } from "bun:test";
import { createRef, type ChangeEvent, type KeyboardEvent, type ReactElement, type InputHTMLAttributes } from "react";
import { ScannerInput } from "@/components/ScannerInput";

describe("ScannerInput", () => {
    it("should wire value and handlers to the underlying input", () => {
        const inputRef = createRef<HTMLInputElement>();
        let changeEventReceived: ChangeEvent<HTMLInputElement> | null = null;
        let enterCount = 0;

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            changeEventReceived = event;
        };

        const handleEnter = () => {
            enterCount += 1;
        };

        const tree = ScannerInput({
            inputRef,
            code: "7591440409094",
            onChange: handleChange,
            onEnter: handleEnter,
        });

        const child = Array.isArray(tree.props.children)
            ? tree.props.children[0]
            : tree.props.children;

        const inputElement = child as ReactElement<InputHTMLAttributes<HTMLInputElement>>;

        expect(inputElement.props.value).toBe("7591440409094");

        const changeEvent = { target: { value: "000" } } as ChangeEvent<HTMLInputElement>;
        const onChange = inputElement.props.onChange;
        if (!onChange) {
            throw new Error("ScannerInput should expose an onChange handler");
        }
        
        onChange(changeEvent);
        if (!changeEventReceived === undefined) {
            throw new Error("ScannerInput should forward change events");
        }
        expect(changeEventReceived).toEqual(changeEvent);

        const keyEvent = { key: "Enter" } as KeyboardEvent<HTMLInputElement>;
        const onKeyDown = inputElement.props.onKeyDown;
        if (!onKeyDown) {
            throw new Error("ScannerInput should expose an onKeyDown handler");
        }
        onKeyDown(keyEvent);
        expect(enterCount).toBe(1);
    });
});
