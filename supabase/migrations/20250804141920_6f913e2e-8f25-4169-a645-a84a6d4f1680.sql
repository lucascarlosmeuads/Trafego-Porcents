-- Reset exportações incorretas do vendedor Edu
UPDATE formularios_parceria 
SET 
  exportado_em = NULL, 
  exportado_por = NULL
WHERE vendedor_responsavel = 'vendedoredu@trafegoporcents.com'
  AND status_negociacao = 'pendente'
  AND exportado_em IS NOT NULL;