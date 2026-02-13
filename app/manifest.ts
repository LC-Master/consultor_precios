import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        display_override: ["window-controls-overlay", "fullscreen"],
        name: "Consultor de Precios Locatel",
        short_name: "Locatel consultor",
        description: "Aplicación de consulta de precios para Locatel",
        start_url: "/check",
        lang: "es",
        display: "standalone",
        categories: ["utilities", "productivity"],
        orientation: "portrait",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
            {
                src: "/logo.webp",
                sizes: "512x512",
                type: "image/webp",
                purpose: "maskable"
            }
        ]
    }
}