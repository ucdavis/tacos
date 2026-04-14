import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    root: "ClientApp",
    build: {
        outDir: "build",
        emptyOutDir: true,
    },
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        strictPort: true,
    },
});
