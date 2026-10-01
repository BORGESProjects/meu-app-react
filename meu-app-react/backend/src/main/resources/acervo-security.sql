-- The public catalogue remains readable, but all writes go through the
-- server endpoint that verifies the Supabase user against ADMIN_EMAIL.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.questoes FROM anon, authenticated;
GRANT SELECT ON TABLE public.questoes TO anon, authenticated;
