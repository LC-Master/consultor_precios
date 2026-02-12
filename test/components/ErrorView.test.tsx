import { describe, expect, it } from "bun:test";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import ErrorView from "@/components/ErrorView";

describe("ErrorView", () => {
    const noop = () => { };

    it("should render the default message when none is provided", () => {
        const html = renderToString(
            <ErrorView onClose={noop} inputRef={createRef()} />
        );

        expect(html).toContain("El producto consultado no se encuentra en sistema.");
        expect(html).toContain("No encontrado");
    });

    it("should render a custom message", () => {
        const html = renderToString(
            <ErrorView message="Producto temporalmente agotado" onClose={noop} inputRef={createRef()} />
        );

        expect(html).toContain("Producto temporalmente agotado");
    });
});
