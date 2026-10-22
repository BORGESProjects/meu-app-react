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
-- Legacy rows are shared templates, not private student progress. Block direct
-- REST writes too; protecting only the Java endpoints does not protect PostgREST.
DO $$
BEGIN
    IF to_regclass('public.edital_itens') IS NOT NULL THEN
        REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.edital_itens FROM anon, authenticated;
        GRANT SELECT ON TABLE public.edital_itens TO anon, authenticated;
        ALTER TABLE public.edital_itens ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
            AND tablename='edital_itens' AND policyname='edital_itens_shared_read') THEN
            CREATE POLICY edital_itens_shared_read ON public.edital_itens
                FOR SELECT TO anon, authenticated USING (true);
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.progresso_usuario (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    horas_estudo jsonb NOT NULL DEFAULT '[]'::jsonb,
    historico_respostas jsonb NOT NULL DEFAULT '[]'::jsonb,
    tarefas jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.progresso_usuario ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.progresso_usuario FROM anon;
REVOKE ALL ON TABLE public.progresso_usuario FROM authenticated;
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

-- Personal syllabuses are separate from shared legacy edital_itens and study logs.
CREATE TABLE IF NOT EXISTS public.editais_usuario (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo text NOT NULL CHECK (length(trim(titulo)) BETWEEN 1 AND 150),
    edicao text NOT NULL DEFAULT '',
    unidade text NOT NULL DEFAULT '',
    data_prova date,
    materias jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(materias) = 'array'),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS editais_usuario_owner_idx ON public.editais_usuario (user_id);
ALTER TABLE public.editais_usuario ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.editais_usuario FROM anon;
REVOKE ALL ON TABLE public.editais_usuario FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.editais_usuario TO authenticated;
DROP POLICY IF EXISTS editais_usuario_select_own ON public.editais_usuario;
CREATE POLICY editais_usuario_select_own ON public.editais_usuario
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS editais_usuario_insert_own ON public.editais_usuario;
CREATE POLICY editais_usuario_insert_own ON public.editais_usuario
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS editais_usuario_update_own ON public.editais_usuario;
CREATE POLICY editais_usuario_update_own ON public.editais_usuario
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS editais_usuario_delete_own ON public.editais_usuario;
CREATE POLICY editais_usuario_delete_own ON public.editais_usuario
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
