
-- Remover a constraint incorreta que está causando conflito
ALTER TABLE meta_ads_configs 
DROP CONSTRAINT IF EXISTS unique_cliente_email_config;

-- Criar constraint correta que permite:
-- 1. Admins terem múltiplas configurações globais (cliente_id = NULL) por email
-- 2. Gestores terem uma configuração específica por cliente
-- 3. Evitar duplicatas reais apenas onde faz sentido
ALTER TABLE meta_ads_configs 
ADD CONSTRAINT unique_cliente_gestor_config 
UNIQUE (cliente_id, email_usuario) 
DEFERRABLE INITIALLY DEFERRED;

-- Criar constraint parcial para configurações globais de admin
-- (permite múltiplas configurações globais por usuário se necessário)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_admin_global_config 
ON meta_ads_configs (email_usuario) 
WHERE cliente_id IS NULL;

-- Atualizar índice para melhor performance
DROP INDEX IF EXISTS idx_meta_ads_configs_cliente_email;
CREATE INDEX IF NOT EXISTS idx_meta_ads_configs_lookup 
ON meta_ads_configs (email_usuario, cliente_id);
