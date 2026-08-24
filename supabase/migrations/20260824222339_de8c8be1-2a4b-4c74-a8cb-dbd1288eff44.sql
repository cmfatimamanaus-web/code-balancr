CREATE TABLE public.registros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  mes_ano TEXT NOT NULL,
  dias JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (numero, mes_ano)
);

GRANT SELECT, INSERT, UPDATE ON public.registros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registros TO authenticated;
GRANT ALL ON public.registros TO service_role;

ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registros visiveis para todos" ON public.registros FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar registro" ON public.registros FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar registro" ON public.registros FOR UPDATE USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON public.registros
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();