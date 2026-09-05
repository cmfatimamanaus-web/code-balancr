import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function pick(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

export function getAdminClient() {
  const url = pick(
    "SUPABASE_URL",
    "VITE_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL"
  );

  const key = pick(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_KEY"
  );

  if (!url || !key) {
    const faltando = [
      ...(!url ? ["SUPABASE_URL"] : []),
      ...(!key ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ].join(", ");

    throw new Error(
      `Configuração do servidor incompleta: variável(is) de ambiente ausente(s): ${faltando}.`
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
