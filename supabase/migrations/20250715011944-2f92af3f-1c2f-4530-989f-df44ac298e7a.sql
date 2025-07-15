-- Criar tabela para armazenar criativos gerados
CREATE TABLE public.criativos_gerados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id BIGINT REFERENCES public.todos_clientes(id),
  email_cliente TEXT NOT NULL,
  email_gestor TEXT NOT NULL,
  nome_arquivo_pdf TEXT NOT NULL,
  caminho_pdf TEXT NOT NULL,
  dados_extraidos JSONB NOT NULL DEFAULT '{}',
  criativos JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'processando',
  processado_em TIMESTAMP WITH TIME ZONE,
  custo_processamento NUMERIC DEFAULT 0,
  aprovado_por TEXT,
  aprovado_em TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.criativos_gerados ENABLE ROW LEVEL SECURITY;

-- Política para clientes verem seus próprios criativos
CREATE POLICY "Clientes podem ver seus próprios criativos" 
ON public.criativos_gerados 
FOR SELECT 
USING (email_cliente = auth.email());

-- Política para gestores verem criativos de seus clientes
CREATE POLICY "Gestores podem ver criativos de seus clientes" 
ON public.criativos_gerados 
FOR ALL 
USING (
  email_gestor = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.gestores 
    WHERE email = auth.email() AND ativo = true
  ) OR 
  is_admin_user()
);

-- Política para inserção por gestores e clientes
CREATE POLICY "Gestores e clientes podem criar criativos" 
ON public.criativos_gerados 
FOR INSERT 
WITH CHECK (
  email_cliente = auth.email() OR 
  email_gestor = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.gestores 
    WHERE email = auth.email() AND ativo = true
  ) OR 
  is_admin_user()
);

-- Criar tabela para templates de criativos
CREATE TABLE public.templates_criativos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  layout_config JSONB NOT NULL DEFAULT '{}',
  elementos_visuais JSONB NOT NULL DEFAULT '{}',
  prompts_geracao JSONB NOT NULL DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  performance_score NUMERIC DEFAULT 0,
  uso_contador INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.templates_criativos ENABLE ROW LEVEL SECURITY;

-- Política para leitura por usuários autenticados
CREATE POLICY "Usuários autenticados podem ver templates" 
ON public.templates_criativos 
FOR SELECT 
USING (ativo = true);

-- Política para admins gerenciarem templates
CREATE POLICY "Admins podem gerenciar templates" 
ON public.templates_criativos 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Inserir alguns templates básicos
INSERT INTO public.templates_criativos (nome, categoria, layout_config, elementos_visuais, prompts_geracao) VALUES
(
  'E-commerce Moderno',
  'vendas',
  '{"layout": "split", "texto_posicao": "left", "imagem_posicao": "right"}',
  '{"cores": ["#ff6b6b", "#4ecdc4"], "tipografia": "moderna", "estilo": "minimalista"}',
  '{"estilo_base": "modern e-commerce design", "elementos": ["produto em destaque", "background limpo", "cores vibrantes"]}'
),
(
  'Serviços Profissionais',
  'servicos',
  '{"layout": "centered", "texto_posicao": "bottom", "imagem_posicao": "top"}',
  '{"cores": ["#2c3e50", "#3498db"], "tipografia": "profissional", "estilo": "corporativo"}',
  '{"estilo_base": "professional services design", "elementos": ["pessoa profissional", "ambiente corporativo", "cores sóbrias"]}'
),
(
  'Curso Online',
  'educacao',
  '{"layout": "overlay", "texto_posicao": "center", "imagem_posicao": "background"}',
  '{"cores": ["#e74c3c", "#f39c12"], "tipografia": "educativa", "estilo": "motivacional"}',
  '{"estilo_base": "online education design", "elementos": ["estudante feliz", "elementos de aprendizado", "cores energéticas"]}'
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_criativos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criativos_gerados
CREATE TRIGGER update_criativos_gerados_updated_at
BEFORE UPDATE ON public.criativos_gerados
FOR EACH ROW
EXECUTE FUNCTION update_criativos_updated_at();

-- Trigger para templates_criativos
CREATE TRIGGER update_templates_criativos_updated_at
BEFORE UPDATE ON public.templates_criativos
FOR EACH ROW
EXECUTE FUNCTION update_criativos_updated_at();