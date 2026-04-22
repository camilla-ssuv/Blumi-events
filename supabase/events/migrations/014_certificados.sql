-- Migration 014: Suporte a certificados de participação por evento

ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS emitir_certificados boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificado_titulo text DEFAULT 'Certificado de Participação',
  ADD COLUMN IF NOT EXISTS certificado_carga_horaria text;

COMMENT ON COLUMN eventos.emitir_certificados IS 'Quando true, participantes com check-in válido podem acessar seu certificado';
COMMENT ON COLUMN eventos.certificado_titulo IS 'Título exibido no certificado (ex: Certificado de Participação)';
COMMENT ON COLUMN eventos.certificado_carga_horaria IS 'Carga horária exibida no certificado (ex: 8 horas)';
