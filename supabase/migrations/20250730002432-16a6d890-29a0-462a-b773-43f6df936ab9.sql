-- Atualizar todos os clientes "Cliente Novo" pendentes que estão com comissões incorretas
-- Definir valor_venda_inicial = 500 e valor_comissao = 100 para clientes sem valor inicial definido
UPDATE todos_clientes 
SET 
  valor_venda_inicial = 500,
  valor_comissao = 100
WHERE status_campanha = 'Cliente Novo' 
  AND comissao = 'Pendente' 
  AND (valor_venda_inicial IS NULL OR valor_comissao NOT IN (80, 100));