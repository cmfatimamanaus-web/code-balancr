CREATE TABLE public.registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL,
  mes_ano text NOT NULL,
  dias jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (numero, mes_ano)
);

GRANT SELECT, INSERT, UPDATE ON public.registros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registros TO authenticated;
GRANT ALL ON public.registros TO service_role;

ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "registros_select_all" ON public.registros FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "registros_insert_all" ON public.registros FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "registros_update_all" ON public.registros FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER registros_updated_at BEFORE UPDATE ON public.registros
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();