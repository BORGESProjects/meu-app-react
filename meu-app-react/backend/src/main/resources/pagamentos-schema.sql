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
REVOKE ALL ON TABLE public.checkouts_mercado_pago FROM PUBLIC, anon, authenticated;
ALTER TABLE public.checkouts_mercado_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acesso_comercial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_recebidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_pago_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_pago_connection ENABLE ROW LEVEL SECURITY;
