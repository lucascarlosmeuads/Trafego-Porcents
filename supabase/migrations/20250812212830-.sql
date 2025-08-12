-- Mover gustavobasilio1904@gmail.com de clientes_parceria para todos_clientes

-- Primeiro, inserir na tabela todos_clientes baseado nos dados de clientes_parceria
INSERT INTO public.todos_clientes (
  nome_cliente,
  email_cliente,
  telefone,
  vendedor,
  email_gestor,
  status_campanha,
  data_venda,
  valor_comissao,
  comissao,
  created_at,
  updated_at
)
SELECT 
  COALESCE(cp.nome_cliente, 'Gustavo Basílio') as nome_cliente,
  cp.email_cliente,
  COALESCE(cp.telefone, COALESCE(cp.dados_formulario->>'telefone', cp.dados_formulario->'dadosPersonais'->>'whatsapp', '')) as telefone,
  'sistema' as vendedor,
  'admin@trafegoporcents.com' as email_gestor,
  'Cliente Antigo' as status_campanha,
  CURRENT_DATE as data_venda,
  60.00 as valor_comissao,
  'Pendente' as comissao,
  cp.created_at,
  now() as updated_at
FROM public.clientes_parceria cp
WHERE cp.email_cliente = 'gustavobasilio1904@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.todos_clientes tc 
  WHERE tc.email_cliente = 'gustavobasilio1904@gmail.com'
);

-- Depois, remover da tabela clientes_parceria
DELETE FROM public.clientes_parceria 
WHERE email_cliente = 'gustavobasilio1904@gmail.com';