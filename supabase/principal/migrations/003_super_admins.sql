-- Sprint 2 | Supabase Principal
-- Super-admins: role com acesso total ao painel de módulos da Blūmi
-- Qualquer user_id desta tabela recebe is_super_admin=true no JWT

CREATE TABLE IF NOT EXISTS public.super_admins (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       text        NOT NULL,
  criado_por uuid        REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Super-admins só são visíveis para outros super-admins (via service role no hook)
CREATE POLICY "super_admins_select" ON public.super_admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

COMMENT ON TABLE public.super_admins IS
  'Usuários com acesso ao painel Blūmi super-admin. Máx recomendado: ~10 pessoas.';
