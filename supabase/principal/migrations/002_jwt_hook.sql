-- Sprint 1 | Supabase Principal
-- JWT Hook: injeta modulos_ativos e company_id no access token
-- Registrar em: Authentication → Hooks → Custom Access Token Hook

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_modulos    text[];
  v_user_id    uuid;
BEGIN
  v_user_id := (event->>'user_id')::uuid;

  -- Resolve company do usuário
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

  -- Injeta claims no token
  event := jsonb_set(
    event,
    '{claims,modulos_ativos}',
    to_jsonb(COALESCE(v_modulos, ARRAY[]::text[]))
  );

  event := jsonb_set(
    event,
    '{claims,company_id}',
    to_jsonb(v_company_id::text)
  );

  RETURN event;
END;
$$;

-- Conceder permissão para o hook executar como service role
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
