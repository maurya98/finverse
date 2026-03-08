import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/admin_dashboard/",
  plugins: [tailwindcss(), react()],
  server: {
    port: 5005,
  },
});