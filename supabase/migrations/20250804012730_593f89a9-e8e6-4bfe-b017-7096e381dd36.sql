-- Marcar o lead Kuesley como pago para atingir 19 vendas conforme lista da Kiwify
UPDATE public.formularios_parceria 
SET cliente_pago = true
WHERE email_usuario = 'kuesley@playservicos.com.br';

-- Verificar total de vendas pagas (deve ser 19 agora)
-- SELECT COUNT(*) as vendas_pagas 
-- FROM public.formularios_parceria 
-- WHERE cliente_pago = true AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') = CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo';