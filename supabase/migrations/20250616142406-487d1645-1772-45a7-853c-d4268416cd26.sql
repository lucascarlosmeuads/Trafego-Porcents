
-- Criar tabela para solicitações de site
CREATE TABLE public.solicitacoes_site (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_cliente text NOT NULL,
  nome_cliente text NOT NULL,
  telefone text,
  email_gestor text,
  status text NOT NULL DEFAULT 'pendente',
  dados_preenchidos boolean DEFAULT false,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.solicitacoes_site ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Clientes só veem suas próprias solicitações
CREATE POLICY "cliente_acesso_proprio_site" ON solicitacoes_site
FOR ALL USING (email_cliente = auth.email());

-- Gestores veem solicitações de seus clientes
CREATE POLICY "gestor_acesso_gestoria_site" ON solicitacoes_site
FOR ALL USING (
  email_gestor = auth.email() OR 
  auth.email() = 'andreza@trafegoporcents.com' OR
  auth.email() LIKE '%@admin%'
);

-- Trigger para updated_at
CREATE TRIGGER update_solicitacoes_site_updated_at
  BEFORE UPDATE ON solicitacoes_site
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar realtime
ALTER TABLE public.solicitacoes_site REPLICA IDENTITY FULL;
