-- Execute once in the Supabase SQL editor to enable cross-device personal study sync.
CREATE TABLE IF NOT EXISTS public.estudo_pessoal_usuario (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    dados jsonb NOT NULL DEFAULT '{"filtros":[],"cadernos":[],"questoes":{},"simulados":[],"configuracoes":[],"removidos":{"filtros":[],"cadernos":[],"questoes":[],"simulados":[],"configuracoes":[]}}'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.estudo_pessoal_usuario ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.estudo_pessoal_usuario FROM anon;
REVOKE ALL ON TABLE public.estudo_pessoal_usuario FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.estudo_pessoal_usuario TO authenticated;

DROP POLICY IF EXISTS estudo_pessoal_usuario_select_own ON public.estudo_pessoal_usuario;
CREATE POLICY estudo_pessoal_usuario_select_own ON public.estudo_pessoal_usuario
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS estudo_pessoal_usuario_insert_own ON public.estudo_pessoal_usuario;
CREATE POLICY estudo_pessoal_usuario_insert_own ON public.estudo_pessoal_usuario
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS estudo_pessoal_usuario_update_own ON public.estudo_pessoal_usuario;
CREATE POLICY estudo_pessoal_usuario_update_own ON public.estudo_pessoal_usuario
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS estudo_pessoal_usuario_delete_own ON public.estudo_pessoal_usuario;
CREATE POLICY estudo_pessoal_usuario_delete_own ON public.estudo_pessoal_usuario
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
