import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  optimizeDeps: {
    exclude: ["@tanstack/start-server-core", "@tanstack/react-start/server-entry"],
  },
});
