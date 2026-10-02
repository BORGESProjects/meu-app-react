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
