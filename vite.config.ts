import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true, // <--- TAMBAHKAN BARIS INI
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});