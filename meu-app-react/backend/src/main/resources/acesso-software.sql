-- Permissões nominais são independentes do histórico de pagamentos.
CREATE TABLE IF NOT EXISTS public.permissoes_software (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE CHECK (email = lower(trim(email))),
    papel text NOT NULL CHECK (papel IN ('aluno','administrador'))
);
CREATE UNIQUE INDEX IF NOT EXISTS permissoes_software_admin_unico
    ON public.permissoes_software (papel) WHERE papel = 'administrador';
ALTER TABLE public.permissoes_software ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.permissoes_software FROM PUBLIC, anon, authenticated;

-- O cliente só pode consultar a identidade verificada da sua própria sessão.
CREATE OR REPLACE FUNCTION public.meu_acesso_software() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    WITH conta AS (
        SELECT id, lower(email) AS email FROM auth.users
        WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL
            AND NOT coalesce(is_anonymous,false)
    ), permissao AS (
        SELECT p.papel FROM conta c JOIN public.permissoes_software p
            ON p.user_id = c.id AND p.email = c.email
    ), assinatura AS (
        SELECT a.* FROM conta c JOIN public.acesso_comercial a ON lower(a.email) = c.email
        WHERE a.status IN ('active','cancelled') AND a.access_until > now()
        ORDER BY a.access_until DESC LIMIT 1
    )
    SELECT jsonb_build_object(
        'liberado', EXISTS(SELECT 1 FROM permissao) OR EXISTS(SELECT 1 FROM assinatura),
        'administrador', EXISTS(SELECT 1 FROM permissao WHERE papel='administrador'),
        'concessao', EXISTS(SELECT 1 FROM permissao),
        'validoAte', (SELECT access_until FROM assinatura),
        'offlineAte', CASE WHEN EXISTS(SELECT 1 FROM permissao) THEN now() + interval '7 days'
                           ELSE (SELECT access_until FROM assinatura) END,
        'cancelamentoAgendado', coalesce((SELECT status='cancelled' FROM assinatura),false),
        'plano', (SELECT plan_key FROM assinatura), 'ciclo', (SELECT billing_cycle FROM assinatura)
    );
$$;
REVOKE ALL ON FUNCTION public.meu_acesso_software() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.meu_acesso_software() TO authenticated;
