-- Limpar imagens existentes com email_cliente vazio ou inválido
UPDATE criativos_gerados 
SET email_cliente = NULL 
WHERE email_cliente = '' OR email_cliente IS NULL;

-- Deletar registros órfãos sem cliente válido
DELETE FROM criativos_gerados 
WHERE email_cliente IS NULL 
AND caminho_pdf = 'planejamento-estrategico';