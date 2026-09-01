CREATE TABLE public.passkeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  numero text NOT NULL,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  counter bigint NOT NULL DEFAULT 0,
  transports text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, DELETE ON public.passkeys TO authenticated;
GRANT ALL ON public.passkeys TO service_role;

ALTER TABLE public.passkeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY passkeys_select_own ON public.passkeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY passkeys_delete_own ON public.passkeys
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX passkeys_numero_idx ON public.passkeys (numero);

CREATE TRIGGER passkeys_updated_at
  BEFORE UPDATE ON public.passkeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.passkey_desafios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  referencia text NOT NULL,
  desafio text NOT NULL,
  expira_em timestamptz NOT NULL DEFAULT now() + interval '5 minutes',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.passkey_desafios TO service_role;

ALTER TABLE public.passkey_desafios ENABLE ROW LEVEL SECURITY;