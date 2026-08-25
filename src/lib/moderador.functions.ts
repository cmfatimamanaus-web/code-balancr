import { createServerFn } from "@tanstack/react-start";

type Payload = { senha: string; mesAno?: string; ano?: number };

function validarSenha(senha: string) {
  const esperada = process.env["MODERADOR_SENHA"] ?? "responsavel2026";
  if (senha !== esperada) throw new Error("Senha incorreta.");
}

export const consolidadoModerador = createServerFn({ method: "POST" })
  .inputValidator((input: Payload) => input)
  .handler(async ({ data }) => {
    validarSenha(data.senha);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin.from("registros").select("numero, mes_ano, dias");
    if (data.mesAno) query = query.eq("mes_ano", data.mesAno);
    else if (data.ano) query = query.like("mes_ano", `%-${data.ano}`);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    return (rows ?? []).map((r) => ({
      numero: String(r.numero),
      mesIndex: Number(String(r.mes_ano).split("-")[0]) - 1,
      dias: (r.dias ?? {}) as Record<string, Record<string, number>>,
    }));
  });
