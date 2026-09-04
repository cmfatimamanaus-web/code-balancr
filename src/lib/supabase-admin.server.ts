// Cliente administrativo (service role) resiliente a diferentes nomes de
// variáveis de ambiente entre Lovable, Vercel e outros provedores.
// SOMENTE servidor: este arquivo nunca pode ser importado por código de cliente.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function pick(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

function isNewApiKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export function getAdminClient() {
  const url = pick("SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const key = pick("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_KEY");

  if (!url || !key) {
    const faltando = [
      ...(!url ? ["SUPABASE_URL"] : []),
      ...(!key ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ].join(", ");
    throw new Error(
      `Configuração do servidor incompleta: variável(is) de ambiente ausente(s): ${faltando}. ` +
        `Cadastre-as no ambiente de produção (ex.: Vercel > Settings > Environment Variables).`,
    );
  }

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNewApiKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
