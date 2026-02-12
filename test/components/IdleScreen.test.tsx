import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { IdleScreen } from "@/components/IdleScreen";

describe("IdleScreen", () => {
    it("should show the component by default", () => {
        const html = renderToString(<IdleScreen />);

        expect(html).toContain("Consulta Aquí");
        expect(html).toContain("opacity-100");
    });

    it("should hide the component when hidden flag is true", () => {
        const html = renderToString(<IdleScreen hidden />);

        expect(html).toContain("opacity-0");
        expect(html).not.toContain("opacity-100");
    });
});
