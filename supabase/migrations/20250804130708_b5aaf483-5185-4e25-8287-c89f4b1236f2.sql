-- Adicionar colunas de controle de exportação na tabela formularios_parceria
ALTER TABLE formularios_parceria 
ADD COLUMN IF NOT EXISTS exportado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS exportado_por TEXT;

-- Criar índice para melhorar performance das consultas de exportação
CREATE INDEX IF NOT EXISTS idx_formularios_parceria_exportacao 
ON formularios_parceria(vendedor_responsavel, exportado_em, status_negociacao);

-- Comentário das novas colunas
COMMENT ON COLUMN formularios_parceria.exportado_em IS 'Timestamp de quando o lead foi exportado pelo vendedor';
COMMENT ON COLUMN formularios_parceria.exportado_por IS 'Email do vendedor que exportou o lead';