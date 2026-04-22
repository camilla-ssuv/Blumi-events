-- Sprint 1 | Supabase Events — Migration 2/11
-- Usuarios: admins e operadores. NÃO participantes.

CREATE TABLE IF NOT EXISTS public.usuarios (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  auth_uid   uuid        NOT NULL UNIQUE, -- auth.uid() do Supabase Principal
  nome       text        NOT NULL,
  email      text        NOT NULL,
  role       text        NOT NULL CHECK (role IN ('admin', 'operador')),
  ativo      boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usuarios_tenant_id_idx ON public.usuarios(tenant_id);
CREATE INDEX IF NOT EXISTS usuarios_auth_uid_idx ON public.usuarios(auth_uid);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Admin/operador vê apenas usuários do próprio tenant
CREATE POLICY "usuarios_select_own_tenant" ON public.usuarios
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );
