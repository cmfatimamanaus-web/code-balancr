ALTER TABLE public.registros ADD COLUMN IF NOT EXISTS user_id uuid;

DROP POLICY IF EXISTS registros_insert_all ON public.registros;
DROP POLICY IF EXISTS registros_select_all ON public.registros;
DROP POLICY IF EXISTS registros_update_all ON public.registros;

REVOKE ALL ON public.registros FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.registros TO authenticated;
GRANT ALL ON public.registros TO service_role;

ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY registros_select_own ON public.registros
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY registros_insert_own ON public.registros
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY registros_update_own ON public.registros
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS registros_user_mes_idx ON public.registros (user_id, mes_ano);