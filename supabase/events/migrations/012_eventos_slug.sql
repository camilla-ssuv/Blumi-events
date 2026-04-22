-- Sprint 4 | Supabase Events — Migration 12
-- Adiciona slug único para URLs públicas dos eventos

ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS eventos_slug_idx ON public.eventos(slug)
  WHERE slug IS NOT NULL;

-- Função para gerar slug a partir do nome
CREATE OR REPLACE FUNCTION public.gerar_slug(nome text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(
        translate(nome,
          'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ',
          'aaaaaaeeeeiiiiooooouuuucnAAAAAAAAEEEEIIIIOOOOOUUUUCN'
        ),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
$$;
