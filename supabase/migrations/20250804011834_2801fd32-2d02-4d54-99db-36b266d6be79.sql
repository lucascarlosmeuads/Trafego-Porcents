-- Corrigir dados de vendas Kiwify
-- 1. Corrigir o email com typo
UPDATE public.formularios_parceria 
SET email_usuario = 'cleitianesilvaesilva@gmail.com'
WHERE email_usuario = 'cleitianesilvaesilva@gmail.om';

-- 2. Desmarcar a venda extra que não está na lista oficial da Kiwify
UPDATE public.formularios_parceria 
SET cliente_pago = false
WHERE email_usuario = 'kuesley@playservicos.com.br';

-- Verificar resultado: deve ter exatamente 18 vendas pagas
-- SELECT COUNT(*) as vendas_pagas 
-- FROM public.formularios_parceria 
-- WHERE cliente_pago = true;