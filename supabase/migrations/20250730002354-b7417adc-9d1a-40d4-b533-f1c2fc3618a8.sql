-- Atualizar todos os clientes "Cliente Novo" pendentes que estão com comissões incorretas
-- Definir valor_venda_inicial = 500 e valor_comissao = 100 para clientes sem valor inicial definido
UPDATE todos_clientes 
SET 
  valor_venda_inicial = 500,
  valor_comissao = 100
WHERE status_campanha = 'Cliente Novo' 
  AND comissao = 'Pendente' 
  AND (valor_venda_inicial IS NULL OR valor_comissao NOT IN (80, 100));

-- Log para verificação
SELECT id, nome_cliente, status_campanha, valor_venda_inicial, valor_comissao, comissao
FROM todos_clientes 
WHERE status_campanha = 'Cliente Novo' AND comissao = 'Pendente'
ORDER BY updated_at DESC;