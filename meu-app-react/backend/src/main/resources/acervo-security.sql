-- The public catalogue remains readable, but all writes go through the
-- server endpoint that verifies the Supabase user against ADMIN_EMAIL.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.questoes FROM anon, authenticated;
GRANT SELECT ON TABLE public.questoes TO anon, authenticated;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'questoes' AND policyname = 'questoes_public_read'
    ) THEN
        CREATE POLICY questoes_public_read ON public.questoes
            FOR SELECT TO anon, authenticated USING (true);
    END IF;
END $$;

-- Every authenticated account owns exactly one private progress record.
CREATE TABLE IF NOT EXISTS public.progresso_usuario (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    horas_estudo jsonb NOT NULL DEFAULT '[]'::jsonb,
    historico_respostas jsonb NOT NULL DEFAULT '[]'::jsonb,
    tarefas jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.progresso_usuario ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.progresso_usuario FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.progresso_usuario TO authenticated;

DROP POLICY IF EXISTS progresso_usuario_select_own ON public.progresso_usuario;
CREATE POLICY progresso_usuario_select_own ON public.progresso_usuario
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS progresso_usuario_insert_own ON public.progresso_usuario;
CREATE POLICY progresso_usuario_insert_own ON public.progresso_usuario
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS progresso_usuario_update_own ON public.progresso_usuario;
CREATE POLICY progresso_usuario_update_own ON public.progresso_usuario
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS progresso_usuario_delete_own ON public.progresso_usuario;
CREATE POLICY progresso_usuario_delete_own ON public.progresso_usuario
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
