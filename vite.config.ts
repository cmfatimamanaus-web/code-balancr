import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  optimizeDeps: {
    // Pacotes exclusivos de servidor: nunca devem entrar no pré-bundle do cliente.
    exclude: [
      "@tanstack/start-server-core",
      "@simplewebauthn/server",
      "@simplewebauthn/server/helpers",
    ],
  },
});
