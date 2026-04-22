-- Sprint 2 | Supabase Principal
-- Atualiza o JWT Hook para injetar is_super_admin além de modulos_ativos e company_id
-- Substituir a função criada em 002_jwt_hook.sql

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id    uuid;
  v_modulos       text[];
  v_user_id       uuid;
  v_is_super_admin boolean := false;
BEGIN
  v_user_id := (event->>'user_id')::uuid;

  -- Verifica se é super-admin
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = v_user_id
  ) INTO v_is_super_admin;

  -- Resolve company do usuário (null para super-admins sem empresa)
  SELECT c.id INTO v_company_id
  FROM public.companies c
  JOIN public.company_users cu ON cu.company_id = c.id
  WHERE cu.user_id = v_user_id
  LIMIT 1;

  -- Coleta slugs dos módulos ativos e não expirados
  IF v_company_id IS NOT NULL THEN
    SELECT array_agg(m.slug) INTO v_modulos
    FROM public.company_modulos cm
    JOIN public.modulos m ON m.id = cm.modulo_id
    WHERE cm.company_id = v_company_id
      AND cm.ativo = true
      AND m.ativo = true
      AND (cm.expira_em IS NULL OR cm.expira_em > now());
  END IF;

  -- Injeta claims
  event := jsonb_set(event, '{claims,modulos_ativos}',
    to_jsonb(COALESCE(v_modulos, ARRAY[]::text[])));

  event := jsonb_set(event, '{claims,company_id}',
    to_jsonb(v_company_id::text));

  event := jsonb_set(event, '{claims,is_super_admin}',
    to_jsonb(v_is_super_admin));

  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
