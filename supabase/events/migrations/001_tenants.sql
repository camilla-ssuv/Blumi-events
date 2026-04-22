-- Sprint 1 | Supabase Events — Migration 1/11
-- Tenants: cada empresa cliente que usa o módulo de eventos

CREATE TABLE IF NOT EXISTS public.tenants (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  external_company_id uuid        NOT NULL UNIQUE, -- companies.id do Supabase Principal
  nome                text        NOT NULL,
  cor_primaria        text        NOT NULL DEFAULT '#314C5D',
  logo_url            text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_select_own" ON public.tenants
  FOR SELECT TO authenticated
  USING (external_company_id = (auth.jwt()->>'company_id')::uuid);
