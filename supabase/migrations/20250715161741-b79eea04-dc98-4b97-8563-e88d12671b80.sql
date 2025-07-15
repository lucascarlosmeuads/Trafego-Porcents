-- Criar tabela para análise de PDFs
CREATE TABLE public.pdf_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_gestor TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  dados_extraidos JSONB NOT NULL DEFAULT '{}',
  nome_oferta TEXT,
  proposta_central TEXT,
  publico_alvo TEXT,
  headline_principal TEXT,
  cta TEXT,
  tom_voz TEXT,
  beneficios TEXT[],
  tipo_midia TEXT[],
  status TEXT NOT NULL DEFAULT 'analisando',
  custo_analise DECIMAL(10,2) DEFAULT 0,
  tempo_processamento INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para sessões de geração
CREATE TABLE public.creative_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pdf_analysis_id UUID NOT NULL REFERENCES public.pdf_analysis(id) ON DELETE CASCADE,
  email_gestor TEXT NOT NULL,
  tipo_sessao TEXT NOT NULL DEFAULT 'completa',
  status TEXT NOT NULL DEFAULT 'iniciando',
  total_criativos INTEGER NOT NULL DEFAULT 6,
  criativos_concluidos INTEGER NOT NULL DEFAULT 0,
  custo_total DECIMAL(10,2) DEFAULT 0,
  tempo_total INTEGER,
  configuracao JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expandir tabela criativos_gerados existente
ALTER TABLE public.criativos_gerados 
ADD COLUMN IF NOT EXISTS generation_id UUID REFERENCES public.creative_generations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS tipo_criativo TEXT DEFAULT 'imagem',
ADD COLUMN IF NOT EXISTS prompt_usado TEXT,
ADD COLUMN IF NOT EXISTS api_utilizada TEXT,
ADD COLUMN IF NOT EXISTS duracao_video INTEGER,
ADD COLUMN IF NOT EXISTS resolucao TEXT,
ADD COLUMN IF NOT EXISTS estilo_visual TEXT,
ADD COLUMN IF NOT EXISTS arquivo_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS dados_geracao JSONB DEFAULT '{}';

-- Habilitar RLS
ALTER TABLE public.pdf_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_generations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pdf_analysis
CREATE POLICY "Gestores podem criar análises de PDF" 
ON public.pdf_analysis 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gestores 
    WHERE email = auth.email() AND ativo = true
  ) OR is_admin_user()
);

CREATE POLICY "Gestores podem ver suas análises de PDF" 
ON public.pdf_analysis 
FOR SELECT 
USING (
  email_gestor = auth.email() OR is_admin_user()
);

CREATE POLICY "Gestores podem atualizar suas análises de PDF" 
ON public.pdf_analysis 
FOR UPDATE 
USING (
  email_gestor = auth.email() OR is_admin_user()
);

-- Políticas RLS para creative_generations
CREATE POLICY "Gestores podem criar sessões de geração" 
ON public.creative_generations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gestores 
    WHERE email = auth.email() AND ativo = true
  ) OR is_admin_user()
);

CREATE POLICY "Gestores podem ver suas sessões de geração" 
ON public.creative_generations 
FOR SELECT 
USING (
  email_gestor = auth.email() OR is_admin_user()
);

CREATE POLICY "Gestores podem atualizar suas sessões de geração" 
ON public.creative_generations 
FOR UPDATE 
USING (
  email_gestor = auth.email() OR is_admin_user()
);

-- Funções para triggers de atualização
CREATE OR REPLACE FUNCTION public.update_pdf_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_creative_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática
CREATE TRIGGER update_pdf_analysis_updated_at_trigger
  BEFORE UPDATE ON public.pdf_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pdf_analysis_updated_at();

CREATE TRIGGER update_creative_generations_updated_at_trigger
  BEFORE UPDATE ON public.creative_generations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_creative_generations_updated_at();

-- Índices para performance
CREATE INDEX idx_pdf_analysis_gestor ON public.pdf_analysis(email_gestor);
CREATE INDEX idx_pdf_analysis_status ON public.pdf_analysis(status);
CREATE INDEX idx_creative_generations_gestor ON public.creative_generations(email_gestor);
CREATE INDEX idx_creative_generations_status ON public.creative_generations(status);
CREATE INDEX idx_criativos_gerados_generation ON public.criativos_gerados(generation_id);
CREATE INDEX idx_criativos_gerados_tipo ON public.criativos_gerados(tipo_criativo);