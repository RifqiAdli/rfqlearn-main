import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Ubah bagian nitro menjadi seperti ini:
  nitro: {
    preset: "cloudflare-pages"
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});