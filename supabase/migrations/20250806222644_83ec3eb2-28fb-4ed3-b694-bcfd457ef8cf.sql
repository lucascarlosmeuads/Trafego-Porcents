-- Migração para atualizar status dos leads de parceria
-- Mapeamento: pendente -> lead, aceitou -> comprou, pensando -> planejando

-- Atualizar registros existentes
UPDATE public.formularios_parceria 
SET status_negociacao = CASE 
  WHEN status_negociacao = 'pendente' THEN 'lead'
  WHEN status_negociacao = 'aceitou' THEN 'comprou'
  WHEN status_negociacao = 'pensando' THEN 'planejando'
  ELSE status_negociacao
END
WHERE status_negociacao IN ('pendente', 'aceitou', 'pensando');

-- Log para verificar quantos registros foram atualizados
-- Isso irá aparecer nos logs do Supabase
DO $$
DECLARE
  total_updated INTEGER;
BEGIN
  GET DIAGNOSTICS total_updated = ROW_COUNT;
  RAISE LOG 'Status de leads atualizados: % registros', total_updated;
END $$;