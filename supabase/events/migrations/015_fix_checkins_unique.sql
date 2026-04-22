-- Sprint 9 | Correção crítica: UNIQUE parcial em checkins
-- A constraint UNIQUE(inscricao_id) sem considerar cancelado impede
-- que cancelarCheckin insira um novo registro de correcao_admin.
-- Substituímos por partial unique index: só ativo (cancelado=false).

-- Remove a constraint existente
ALTER TABLE public.checkins DROP CONSTRAINT IF EXISTS checkins_inscricao_id_key;

-- Adiciona partial unique index: apenas um check-in ativo por inscrição
CREATE UNIQUE INDEX IF NOT EXISTS checkins_inscricao_ativo_uq
  ON public.checkins(inscricao_id)
  WHERE cancelado = false;

-- Nota: o índice simples existente já cobre a busca por inscricao_id
