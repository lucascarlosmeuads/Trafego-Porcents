-- Corrigir vendedores para clientenovo@trafegoporcents.com
-- Baseado na análise, vamos transferir alguns clientes que provavelmente deveriam estar com este vendedor

UPDATE todos_clientes 
SET vendedor = 'clientenovo@trafegoporcents.com'
WHERE email_gestor = 'andreza@trafegoporcents.com' 
  AND status_campanha = 'Cliente Novo'
  AND vendedor IN ('Edu', 'Itamar', 'joao', 'João', 'EDU', 'itamar');

-- Log da operação
INSERT INTO comentarios_cliente (cliente_id, comentario, autor, created_at)
SELECT id, 'Cliente transferido para vendedor clientenovo@trafegoporcents.com - correção automática', 'sistema', now()
FROM todos_clientes 
WHERE vendedor = 'clientenovo@trafegoporcents.com' 
  AND email_gestor = 'andreza@trafegoporcents.com'
  AND status_campanha = 'Cliente Novo';