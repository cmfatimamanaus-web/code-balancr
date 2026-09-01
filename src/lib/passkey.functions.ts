import { createServerFn, getRequestHeader } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RP_NAME = "Tesouro Espiritual";

function origemEId() {
  const origin =
    getRequestHeader("origin") ??
    (getRequestHeader("referer")
      ? new URL(getRequestHeader("referer") as string).origin
      : "http://localhost:8080");
  const rpID = new URL(origin).hostname;
  return { origin, rpID };
}

function normalizar(numero: string) {
  return numero.trim().toLowerCase().replace(/[^0-9a-z-]/g, "");
}

/* ---------- cadastro de passkey (membro já autenticado) ---------- */

export const iniciarCadastroPasskey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { generateRegistrationOptions } = await import("@simplewebauthn/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { origin, rpID } = origemEId();

    const { data: user } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const numero = normalizar(
      (user?.user?.user_metadata?.["numero"] as string | undefined) ??
        String(user?.user?.email ?? "").split("@")[0] ??
        "",
    );

    const { data: existentes } = await supabaseAdmin
      .from("passkeys")
      .select("credential_id, transports")
      .eq("user_id", context.userId);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userName: `Nº ${numero}`,
      userDisplayName: `Nº ${numero}`,
      userID: new TextEncoder().encode(context.userId),
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
      excludeCredentials: (existentes ?? []).map((c) => ({
        id: c.credential_id as string,
        transports: (c.transports ?? []) as never,
      })),
    });

    const { data: desafio, error } = await supabaseAdmin
      .from("passkey_desafios")
      .insert({ tipo: "cadastro", referencia: context.userId, desafio: options.challenge })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { options, desafioId: desafio.id as string, origin, numero };
  });

export const concluirCadastroPasskey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { desafioId: string; resposta: unknown; numero: string }) => input)
  .handler(async ({ data, context }) => {
    const { verifyRegistrationResponse } = await import("@simplewebauthn/server");
    const { isoBase64URL } = await import("@simplewebauthn/server/helpers");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { origin, rpID } = origemEId();

    const { data: linha } = await supabaseAdmin
      .from("passkey_desafios")
      .select("desafio, referencia, expira_em")
      .eq("id", data.desafioId)
      .maybeSingle();
    if (!linha || linha.referencia !== context.userId) throw new Error("Desafio inválido.");
    if (new Date(linha.expira_em as string) < new Date()) throw new Error("Desafio expirado.");

    const verificacao = await verifyRegistrationResponse({
      response: data.resposta as never,
      expectedChallenge: linha.desafio as string,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
    if (!verificacao.verified || !verificacao.registrationInfo)
      throw new Error("Não foi possível validar o passkey.");

    const cred = verificacao.registrationInfo.credential;
    const { error } = await supabaseAdmin.from("passkeys").insert({
      user_id: context.userId,
      numero: normalizar(data.numero),
      credential_id: cred.id,
      public_key: isoBase64URL.fromBuffer(cred.publicKey),
      counter: cred.counter,
      transports: cred.transports ?? [],
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("passkey_desafios").delete().eq("id", data.desafioId);
    return { ok: true };
  });

/* ---------- entrada com passkey (público) ---------- */

export const iniciarLoginPasskey = createServerFn({ method: "POST" })
  .inputValidator((input: { numero: string }) => input)
  .handler(async ({ data }) => {
    const { generateAuthenticationOptions } = await import("@simplewebauthn/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { rpID } = origemEId();
    const numero = normalizar(data.numero);

    const { data: creds } = await supabaseAdmin
      .from("passkeys")
      .select("credential_id, transports")
      .eq("numero", numero);
    if (!creds || creds.length === 0)
      throw new Error("Nenhum passkey cadastrado para esse número.");

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      allowCredentials: creds.map((c) => ({
        id: c.credential_id as string,
        transports: (c.transports ?? []) as never,
      })),
    });

    const { data: desafio, error } = await supabaseAdmin
      .from("passkey_desafios")
      .insert({ tipo: "login", referencia: numero, desafio: options.challenge })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { options, desafioId: desafio.id as string };
  });

export const concluirLoginPasskey = createServerFn({ method: "POST" })
  .inputValidator((input: { desafioId: string; resposta: unknown }) => input)
  .handler(async ({ data }) => {
    const { verifyAuthenticationResponse } = await import("@simplewebauthn/server");
    const { isoBase64URL } = await import("@simplewebauthn/server/helpers");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { origin, rpID } = origemEId();

    const { data: linha } = await supabaseAdmin
      .from("passkey_desafios")
      .select("desafio, referencia, expira_em")
      .eq("id", data.desafioId)
      .maybeSingle();
    if (!linha) throw new Error("Desafio inválido.");
    if (new Date(linha.expira_em as string) < new Date()) throw new Error("Desafio expirado.");

    const resposta = data.resposta as { id: string };
    const { data: cred } = await supabaseAdmin
      .from("passkeys")
      .select("id, user_id, counter, public_key, transports, numero")
      .eq("credential_id", resposta.id)
      .maybeSingle();
    if (!cred || cred.numero !== linha.referencia) throw new Error("Passkey não reconhecido.");

    const verificacao = await verifyAuthenticationResponse({
      response: data.resposta as never,
      expectedChallenge: linha.desafio as string,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: resposta.id,
        publicKey: isoBase64URL.toBuffer(cred.public_key as string),
        counter: Number(cred.counter ?? 0),
        transports: (cred.transports ?? []) as never,
      },
    });
    if (!verificacao.verified) throw new Error("Não foi possível validar o passkey.");

    await supabaseAdmin
      .from("passkeys")
      .update({ counter: verificacao.authenticationInfo.newCounter })
      .eq("id", cred.id);
    await supabaseAdmin.from("passkey_desafios").delete().eq("id", data.desafioId);

    const { data: user } = await supabaseAdmin.auth.admin.getUserById(cred.user_id as string);
    const email = user?.user?.email;
    if (!email) throw new Error("Conta não encontrada.");

    const { data: link, error: erroLink } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (erroLink || !link?.properties?.hashed_token)
      throw new Error("Não foi possível iniciar a sessão.");

    return { email, tokenHash: link.properties.hashed_token };
  });
