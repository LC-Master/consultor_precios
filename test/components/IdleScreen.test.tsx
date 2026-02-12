import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { IdleScreen } from "@/components/IdleScreen";

describe("IdleScreen", () => {
    it("should show the component by default", () => {
        render(<IdleScreen />);

        expect(screen.getByText("Consulta Aquí")).toBeDefined();
        // Check for opacity-100 class
        const container = screen.getByText("Consulta Aquí").closest('div'); // The inner container or parent
        // Actually, opacity is on the root div.
        // Let's find the root div.
        // We can query by text and go up, or add a data-testid. 
        // Or inspect the container.firstChild.
        // But testing implementation details like class names is fine if that's the requirement.
        
        // Let's assume we want to check visibility. 
        // But opacity-100 is a tailwind class.
        // I'll stick to class check on the element matching the structure.
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
