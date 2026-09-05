import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    optimizeDeps: {
      // Pacotes exclusivos do servidor: fora do pré-bundle do navegador.
      exclude: [
        "@tanstack/start-server-core",
        "@simplewebauthn/server",
        "@simplewebauthn/server/helpers",
      ],
    },
  },
});
