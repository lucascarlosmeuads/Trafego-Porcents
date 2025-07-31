-- Migração completa: transferir todos os clientes dos últimos 10 dias
-- que estão com email_gestor = 'andreza@trafegoporcents.com' para clientenovo@trafegoporcents.com

-- 1. Transferir todos os clientes dos últimos 10 dias
UPDATE todos_clientes 
SET vendedor = 'clientenovo@trafegoporcents.com'
WHERE email_gestor = 'andreza@trafegoporcents.com' 
  AND created_at >= CURRENT_DATE - INTERVAL '10 days'
  AND vendedor IN ('Edu', 'Itamar', 'joao', 'João', 'EDU', 'itamar');

-- 2. Log da operação para histórico
INSERT INTO comentarios_cliente (cliente_id, comentario, autor, created_at)
SELECT 
  id, 
  CONCAT('Cliente transferido de ', vendedor, ' para clientenovo@trafegoporcents.com - migração completa histórico 10 dias'), 
  'sistema', 
  now()
FROM todos_clientes 
WHERE vendedor = 'clientenovo@trafegoporcents.com' 
  AND email_gestor = 'andreza@trafegoporcents.com'
  AND created_at >= CURRENT_DATE - INTERVAL '10 days';

-- 3. Verificar resultado da migração
SELECT 
  'Após migração' as status,
  vendedor,
  COUNT(*) as total_clientes,
  DATE(created_at) as data_cadastro
FROM todos_clientes 
WHERE email_gestor = 'andreza@trafegoporcents.com'
  AND created_at >= CURRENT_DATE - INTERVAL '10 days'
GROUP BY vendedor, DATE(created_at)
ORDER BY data_cadastro DESC, vendedor;