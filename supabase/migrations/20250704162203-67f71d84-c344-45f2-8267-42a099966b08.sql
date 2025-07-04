
-- Criar tabela para clientes antigos
CREATE TABLE public.clientes_antigos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cliente text NOT NULL,
  email_cliente text NOT NULL,
  telefone text NOT NULL,
  vendedor text NOT NULL,
  email_gestor text NOT NULL,
  data_venda date NOT NULL,
  valor_comissao numeric NOT NULL DEFAULT 60.00,
  comissao text NOT NULL DEFAULT 'Pendente',
  site_status text NOT NULL DEFAULT 'pendente',
  site_pago boolean NOT NULL DEFAULT false,
  descricao_problema text,
  link_briefing text,
  link_criativo text,
  link_site text,
  numero_bm text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.clientes_antigos ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os clientes antigos
CREATE POLICY "Admins can view all clientes antigos"
ON public.clientes_antigos
FOR SELECT
USING (is_admin_user());

-- Política para gestores verem seus próprios clientes antigos
CREATE POLICY "Gestores can view their own clientes antigos"
ON public.clientes_antigos
FOR SELECT
USING (email_gestor = auth.email());

-- Política para admins e gestores inserirem clientes antigos
CREATE POLICY "Admins and gestores can insert clientes antigos"
ON public.clientes_antigos
FOR INSERT
WITH CHECK (is_admin_user() OR (email_gestor = auth.email() AND is_gestor_user()));

-- Política para admins e gestores atualizarem clientes antigos
CREATE POLICY "Admins and gestores can update clientes antigos"
ON public.clientes_antigos
FOR UPDATE
USING (is_admin_user() OR (email_gestor = auth.email() AND is_gestor_user()))
WITH CHECK (is_admin_user() OR (email_gestor = auth.email() AND is_gestor_user()));

-- Política para admins deleterem clientes antigos
CREATE POLICY "Admins can delete clientes antigos"
ON public.clientes_antigos
FOR DELETE
USING (is_admin_user());

-- Criar índices para performance
CREATE INDEX idx_clientes_antigos_email_gestor ON public.clientes_antigos(email_gestor);
CREATE INDEX idx_clientes_antigos_created_at ON public.clientes_antigos(created_at DESC);
CREATE INDEX idx_clientes_antigos_email_cliente ON public.clientes_antigos(email_cliente);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_clientes_antigos_updated_at
  BEFORE UPDATE ON public.clientes_antigos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
