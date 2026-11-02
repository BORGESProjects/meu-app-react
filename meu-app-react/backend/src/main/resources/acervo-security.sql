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

-- Students can opt into a public, pseudonymous leaderboard. Profile rows remain
-- private to their owner; the RPC returns only the alias and aggregate totals.
CREATE TABLE IF NOT EXISTS public.perfil_ranking_usuario (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    apelido text NOT NULL DEFAULT 'Estudante'
        CHECK (char_length(trim(apelido)) BETWEEN 3 AND 24),
    publico boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.perfil_ranking_usuario ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS perfil_ranking_publico_idx
    ON public.perfil_ranking_usuario (apelido) WHERE publico = true;
REVOKE ALL ON TABLE public.perfil_ranking_usuario FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.perfil_ranking_usuario TO authenticated;
DROP POLICY IF EXISTS perfil_ranking_select_own ON public.perfil_ranking_usuario;
CREATE POLICY perfil_ranking_select_own ON public.perfil_ranking_usuario
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS perfil_ranking_insert_own ON public.perfil_ranking_usuario;
CREATE POLICY perfil_ranking_insert_own ON public.perfil_ranking_usuario
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS perfil_ranking_update_own ON public.perfil_ranking_usuario;
CREATE POLICY perfil_ranking_update_own ON public.perfil_ranking_usuario
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS perfil_ranking_delete_own ON public.perfil_ranking_usuario;
CREATE POLICY perfil_ranking_delete_own ON public.perfil_ranking_usuario
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.ranking_estudo_publico(
    p_ordenacao text DEFAULT 'questoes',
    p_limite integer DEFAULT 20
)
RETURNS TABLE (
    posicao integer,
    apelido text,
    questoes_respondidas bigint,
    segundos_estudo bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    WITH totais AS (
        SELECT
            perfil.apelido,
            COALESCE(respostas.quantidade, 0)::bigint AS questoes_respondidas,
            COALESCE(horas.segundos, 0)::bigint AS segundos_estudo
        FROM public.perfil_ranking_usuario AS perfil
        LEFT JOIN public.progresso_usuario AS progresso ON progresso.user_id = perfil.user_id
        LEFT JOIN LATERAL (
            SELECT count(*) AS quantidade
            FROM jsonb_array_elements(
                CASE WHEN jsonb_typeof(progresso.historico_respostas) = 'array'
                    THEN progresso.historico_respostas ELSE '[]'::jsonb END
            ) AS resposta(item)
            WHERE jsonb_typeof(resposta.item) = 'object'
                AND resposta.item->>'acertou' IN ('true', 'false')
        ) AS respostas ON true
        LEFT JOIN LATERAL (
            SELECT trunc(least(COALESCE(sum(
                CASE
                    WHEN (
                        CASE WHEN length(estudo.item->>'segundos') <= 16
                            THEN CASE WHEN estudo.item->>'segundos' ~ '^[0-9]+([.][0-9]+)?$'
                                THEN (estudo.item->>'segundos')::numeric ELSE 0 END
                            ELSE 0 END
                    ) > 0
                        THEN (estudo.item->>'segundos')::numeric
                    WHEN (
                        CASE WHEN length(estudo.item->>'horas') <= 16
                            THEN CASE WHEN estudo.item->>'horas' ~ '^[0-9]+([.][0-9]+)?$'
                                THEN (estudo.item->>'horas')::numeric ELSE 0 END
                            ELSE 0 END
                    ) > 0
                        THEN (estudo.item->>'horas')::numeric * 3600
                    ELSE 0
                END
            ), 0), 9223372036854775807))::bigint AS segundos
            FROM jsonb_array_elements(
                CASE WHEN jsonb_typeof(progresso.horas_estudo) = 'array'
                    THEN progresso.horas_estudo ELSE '[]'::jsonb END
            ) AS estudo(item)
            WHERE jsonb_typeof(estudo.item) = 'object'
        ) AS horas ON true
        WHERE perfil.publico = true
    ), ordenados AS (
        SELECT
            row_number() OVER (
                ORDER BY
                    CASE WHEN lower(p_ordenacao) = 'tempo' THEN totais.segundos_estudo END DESC,
                    CASE WHEN lower(p_ordenacao) <> 'tempo' THEN totais.questoes_respondidas END DESC,
                    totais.apelido ASC
            )::integer AS posicao,
            totais.apelido,
            totais.questoes_respondidas,
            totais.segundos_estudo
        FROM totais
    )
    SELECT ordenados.posicao, ordenados.apelido,
        ordenados.questoes_respondidas, ordenados.segundos_estudo
    FROM ordenados
    ORDER BY ordenados.posicao
    LIMIT LEAST(GREATEST(COALESCE(p_limite, 20), 1), 50);
END;
$$;

REVOKE ALL ON FUNCTION public.ranking_estudo_publico(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ranking_estudo_publico(text, integer) TO authenticated;

-- Private study notebooks, saved searches, annotations and simulation history.
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

-- Entitlements are created only by verified payment webhooks. Keep provider
-- event IDs for idempotency so retries cannot duplicate renewals.
CREATE TABLE IF NOT EXISTS public.acesso_comercial (
    provider text NOT NULL,
    subscription_id text NOT NULL,
    payment_reference text NOT NULL,
    email text NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'cancelled', 'refunded', 'charged_back', 'expired')),
    access_until timestamptz NOT NULL,
    plan_key text NOT NULL DEFAULT 'basica' CHECK (plan_key IN ('basica','premium')),
    billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','quarterly','annual')),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (provider, subscription_id)
);
ALTER TABLE public.acesso_comercial ADD COLUMN IF NOT EXISTS plan_key text NOT NULL DEFAULT 'basica';
ALTER TABLE public.acesso_comercial ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly';
CREATE INDEX IF NOT EXISTS acesso_comercial_email_idx ON public.acesso_comercial (lower(email), access_until DESC);
CREATE TABLE IF NOT EXISTS public.eventos_pagamento (
    provider text NOT NULL,
    event_id text NOT NULL,
    received_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (provider, event_id)
);
CREATE TABLE IF NOT EXISTS public.pagamentos_recebidos (
    provider text NOT NULL,
    event_id text NOT NULL,
    subscription_id text NOT NULL,
    payment_reference text NOT NULL,
    email text NOT NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    currency text NOT NULL CHECK (currency = 'BRL'),
    status text NOT NULL CHECK (status IN ('approved', 'refunded', 'charged_back')),
    paid_at timestamptz NOT NULL,
    access_until timestamptz,
    plan_key text NOT NULL DEFAULT 'basica' CHECK (plan_key IN ('basica','premium')),
    billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','quarterly','annual')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (provider, event_id),
    UNIQUE (provider, payment_reference)
);
ALTER TABLE public.pagamentos_recebidos ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.pagamentos_recebidos ADD COLUMN IF NOT EXISTS plan_key text NOT NULL DEFAULT 'basica';
ALTER TABLE public.pagamentos_recebidos ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly';
CREATE INDEX IF NOT EXISTS pagamentos_recebidos_paid_at_idx ON public.pagamentos_recebidos (paid_at DESC);
CREATE TABLE IF NOT EXISTS public.mercado_pago_oauth_states (
    state_hash text PRIMARY KEY,
    code_verifier_cipher text NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mercado_pago_connection (
    singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
    merchant_id text NOT NULL,
    access_token_cipher text NOT NULL,
    refresh_token_cipher text NOT NULL,
    expires_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE public.acesso_comercial FROM anon, authenticated;
REVOKE ALL ON TABLE public.eventos_pagamento FROM anon, authenticated;
REVOKE ALL ON TABLE public.pagamentos_recebidos FROM anon, authenticated;
REVOKE ALL ON TABLE public.mercado_pago_oauth_states FROM anon, authenticated;
REVOKE ALL ON TABLE public.mercado_pago_connection FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.checkouts_mercado_pago (
    subscription_id text PRIMARY KEY,
    external_reference text UNIQUE NOT NULL,
    email text NOT NULL,
    plan_key text NOT NULL CHECK (plan_key IN ('basica','premium')),
    billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly','quarterly','annual')),
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.checkouts_mercado_pago ADD COLUMN IF NOT EXISTS modality text NOT NULL DEFAULT 'subscription';
REVOKE ALL ON TABLE public.checkouts_mercado_pago FROM PUBLIC, anon, authenticated;
ALTER TABLE public.checkouts_mercado_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acesso_comercial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_recebidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_pago_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_pago_connection ENABLE ROW LEVEL SECURITY;
