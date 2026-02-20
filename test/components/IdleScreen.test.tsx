import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { IdleScreen } from "@/components/IdleScreen";

describe("IdleScreen", () => {
    it("should show the component by default", () => {
        render(<IdleScreen />);

        expect(screen.getByText("Consulta Aquí")).toBeDefined();
    });

    it("should hide the component when hidden flag is true", () => {
        const { container } = render(<IdleScreen hidden />);
        const root = container.firstChild as HTMLElement;
        expect(root.classList.contains("opacity-0")).toBe(true);
        expect(root.classList.contains("opacity-100")).toBe(false);
    });
    
    it("should show the component when hidden flag is false", () => {
        const { container } = render(<IdleScreen hidden={false} />);
        const root = container.firstChild as HTMLElement;
        expect(root.classList.contains("opacity-100")).toBe(true);
    });
});
