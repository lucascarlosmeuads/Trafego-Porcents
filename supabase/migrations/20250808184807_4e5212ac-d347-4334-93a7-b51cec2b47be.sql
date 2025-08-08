-- Rename negotiation statuses: planejamento_entregue -> planejando
UPDATE public.formularios_parceria
SET status_negociacao = 'planejando', updated_at = now()
WHERE status_negociacao = 'planejamento_entregue';
