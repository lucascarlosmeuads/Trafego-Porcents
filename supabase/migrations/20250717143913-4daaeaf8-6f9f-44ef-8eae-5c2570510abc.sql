-- Criar tabela para o acervo de ideias de negócio
CREATE TABLE public.ideias_negocio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_cliente TEXT NOT NULL,
  briefing_id UUID REFERENCES public.briefings_cliente(id) ON DELETE CASCADE,
  titulo_ideia TEXT,
  descricao_projeto TEXT,
  produto_servico TEXT NOT NULL,
  publico_alvo TEXT,
  dores_identificadas TEXT[],
  diferenciais TEXT,
  categoria_negocio TEXT,
  potencial_mercado TEXT,
  investimento_sugerido NUMERIC,
  status_analise TEXT NOT NULL DEFAULT 'pendente',
  insights_ia JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ideias_negocio ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem ver todas as ideias"
ON public.ideias_negocio
FOR SELECT
USING (is_admin_user());

CREATE POLICY "Admins podem atualizar ideias"
ON public.ideias_negocio
FOR UPDATE
USING (is_admin_user());

CREATE POLICY "Sistema pode inserir ideias"
ON public.ideias_negocio
FOR INSERT
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ideias_negocio_updated_at
BEFORE UPDATE ON public.ideias_negocio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_ideias_negocio_email_cliente ON public.ideias_negocio(email_cliente);
CREATE INDEX idx_ideias_negocio_categoria ON public.ideias_negocio(categoria_negocio);
CREATE INDEX idx_ideias_negocio_status ON public.ideias_negocio(status_analise);