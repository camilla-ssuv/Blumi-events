-- Migration 013: Suporte a perguntas condicionais
-- Uma pergunta pode ser condicionada à resposta de outra pergunta anterior

ALTER TABLE perguntas_triagem
  ADD COLUMN IF NOT EXISTS condicao_pergunta_id uuid REFERENCES perguntas_triagem(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS condicao_valor text;

COMMENT ON COLUMN perguntas_triagem.condicao_pergunta_id IS 'Se preenchido, esta pergunta só aparece quando condicao_pergunta_id tiver o valor condicao_valor';
COMMENT ON COLUMN perguntas_triagem.condicao_valor IS 'Valor da resposta que ativa esta pergunta (exato)';
