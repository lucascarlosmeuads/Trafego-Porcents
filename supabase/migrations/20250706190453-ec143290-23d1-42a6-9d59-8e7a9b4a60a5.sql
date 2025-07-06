
-- Adicionar campo para controlar quando o formulário foi acessado
ALTER TABLE public.solicitacoes_site 
ADD COLUMN formulario_acessado_em timestamp with time zone DEFAULT NULL;

-- Adicionar campo para o token único
ALTER TABLE public.solicitacoes_site 
ADD COLUMN token_acesso text DEFAULT NULL;

-- Criar índice único no token para garantir unicidade
CREATE UNIQUE INDEX idx_solicitacoes_site_token ON public.solicitacoes_site(token_acesso);
