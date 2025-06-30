
-- 1. Criar backup dos dados existentes antes das mudanças
CREATE TABLE backup_comissoes_antigas AS 
SELECT id, nome_cliente, valor_comissao, comissao, comissao_paga, created_at 
FROM todos_clientes 
WHERE valor_comissao IS NOT NULL OR comissao IS NOT NULL;

-- 2. Criar tabela de histórico de pagamentos de comissão
CREATE TABLE historico_pagamentos_comissao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id BIGINT NOT NULL REFERENCES todos_clientes(id),
  valor_pago NUMERIC(10,2) NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pago_por TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Adicionar novas colunas para controle avançado na tabela principal
ALTER TABLE todos_clientes ADD COLUMN IF NOT EXISTS ultimo_pagamento_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE todos_clientes ADD COLUMN IF NOT EXISTS ultimo_valor_pago NUMERIC(10,2);
ALTER TABLE todos_clientes ADD COLUMN IF NOT EXISTS total_pago_comissao NUMERIC(10,2) DEFAULT 0;
ALTER TABLE todos_clientes ADD COLUMN IF NOT EXISTS eh_ultimo_pago BOOLEAN DEFAULT false;

-- 4. Migrar dados existentes para o novo formato
INSERT INTO historico_pagamentos_comissao (cliente_id, valor_pago, data_pagamento, pago_por, observacoes)
SELECT 
  id, 
  COALESCE(valor_comissao, 60.00), 
  COALESCE(created_at, now()), 
  'sistema@admin',
  'Migração automática - dados anteriores'
FROM todos_clientes 
WHERE comissao = 'Pago' AND valor_comissao > 0;

-- 5. Atualizar campos de controle para dados migrados
UPDATE todos_clientes 
SET 
  ultimo_pagamento_em = created_at,
  ultimo_valor_pago = COALESCE(valor_comissao, 60.00),
  total_pago_comissao = COALESCE(valor_comissao, 60.00),
  eh_ultimo_pago = true
WHERE comissao = 'Pago' AND valor_comissao > 0;

-- 6. Criar índices para performance
CREATE INDEX idx_historico_pagamentos_cliente ON historico_pagamentos_comissao(cliente_id);
CREATE INDEX idx_historico_pagamentos_data ON historico_pagamentos_comissao(data_pagamento);
CREATE INDEX idx_todos_clientes_ultimo_pago ON todos_clientes(eh_ultimo_pago) WHERE eh_ultimo_pago = true;

-- 7. Trigger para atualizar campos automaticamente
CREATE OR REPLACE FUNCTION update_comissao_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando um pagamento é adicionado ao histórico, atualizar campos na tabela principal
  IF TG_OP = 'INSERT' THEN
    UPDATE todos_clientes 
    SET 
      ultimo_pagamento_em = NEW.data_pagamento,
      ultimo_valor_pago = NEW.valor_pago,
      total_pago_comissao = COALESCE(total_pago_comissao, 0) + NEW.valor_pago,
      eh_ultimo_pago = true,
      comissao = 'Pago'
    WHERE id = NEW.cliente_id;
    
    -- Remover flag de último pago de outros clientes (opcional - só um por vez)
    UPDATE todos_clientes 
    SET eh_ultimo_pago = false 
    WHERE id != NEW.cliente_id AND eh_ultimo_pago = true;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comissao_fields
  AFTER INSERT ON historico_pagamentos_comissao
  FOR EACH ROW EXECUTE FUNCTION update_comissao_fields();
