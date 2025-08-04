-- LIMPEZA COMPLETA E RECADASTRO DOS 19 LEADS PAGOS
-- Etapa 1: Limpar todos os leads pagos atuais
UPDATE public.formularios_parceria 
SET cliente_pago = false, 
    status_negociacao = 'pendente'
WHERE cliente_pago = true;

-- Etapa 2: Inserir os 19 leads novos como pagos
INSERT INTO public.formularios_parceria (
  email_usuario,
  tipo_negocio,
  produto_descricao,
  cliente_pago,
  status_negociacao,
  vendedor_responsavel,
  distribuido_em,
  created_at,
  updated_at,
  respostas,
  completo
) VALUES 
-- Distribuição: 45% Edu (9), 40% Itamar (8), 15% João (2)
('luiziensen22@gmail.com', 'digital', 'Luiz Alberto de Almeida iensen', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Luiz Alberto de Almeida iensen", "telefone": "+5542999600107"}', true),
('kuesley@playservicos.com.br', 'digital', 'Kuesley Fernandes do Nascimento', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Kuesley Fernandes do Nascimento", "telefone": "+5567991360075"}', true),
('gregblue.shop@gmail.com', 'digital', 'Marcelo Gregorio', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Marcelo Gregorio", "telefone": "+5511971545454"}', true),
('jhonatanhr2@hotmail.com', 'digital', 'Jhonatan ribeiro', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Jhonatan ribeiro", "telefone": "+5541999885969"}', true),
('jamilly_oliver@hotmail.com', 'digital', 'Jamille Olivera', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Jamille Olivera", "telefone": "+5511974742241"}', true),
('amersonpereira@icloid.com', 'digital', 'Amerson Juliano Pereira', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Amerson Juliano Pereira", "telefone": "+5547996104629"}', true),
('eiranmarques@gmail.com', 'digital', 'Eiran Marques', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Eiran Marques", "telefone": "+5581971110000"}', true),
('allanalmeida069@gmail.com', 'digital', 'Allan Andrade', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Allan Andrade", "telefone": "+5563991378924"}', true),
('silasdigital10@gmail.com', 'digital', 'Rosilei Antonio Antunes', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Rosilei Antonio Antunes", "telefone": "+5551995394151"}', true),
('pabloalexsander@yahoo.com.br', 'digital', 'Pablo alexsander de souza pereira', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Pablo alexsander de souza pereira", "telefone": "+5598992320069"}', true),
('joao.lima_14@hotmail.com', 'digital', 'João pedro de lima pereira', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "João pedro de lima pereira", "telefone": "+5524974056982"}', true),
('consultrancm@gmail.com', 'digital', 'Marcos willian', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Marcos willian", "telefone": "+5544991127978"}', true),
('luisnascimento.eng@hotmail.com', 'digital', 'Luis Antonio Pereira do Nascimento', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Luis Antonio Pereira do Nascimento", "telefone": "+5566999055524"}', true),
('mrssp1308@gmail.com', 'digital', 'Marcos Roberto silva', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Marcos Roberto silva", "telefone": "+5562992812867"}', true),
('cleitianesilvaesilva@gmail.com', 'digital', 'Cleitiane da Silva e Silva', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Cleitiane da Silva e Silva", "telefone": "+5591991867728"}', true),
('ranotecmt4@gmail.com', 'digital', 'Ranover Alves Rodrigues', true, 'aceitou', 'vendedorjoao@trafegoporcents.com', now(), now(), now(), '{"nome": "Ranover Alves Rodrigues", "telefone": "+5565984052592"}', true),
('masterimoveis.consultoria@hotmail.com', 'digital', 'fabiano oliveira', true, 'aceitou', 'vendedorjoao@trafegoporcents.com', now(), now(), now(), '{"nome": "fabiano oliveira", "telefone": "+5584999382895"}', true),
('marcoswells77@gmail.com', 'digital', 'Marcos Wellington da silva', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Marcos Wellington da silva", "telefone": "+5541997892000"}', true),
('lucasbritocorretor87@gmail.com', 'digital', 'Lucas Brito', true, 'aceitou', 'vendedoredu@trafegoporcents.com', now(), now(), now(), '{"nome": "Lucas Brito", "telefone": "+5585986043622"}', true),
('rayestte@yahoo.com.br', 'digital', 'RAYESTTE Ferreira bruno braga', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "RAYESTTE Ferreira bruno braga", "telefone": "+5531988998780"}', true),
('copetti2006@gmail.com', 'digital', 'Luis Copetti', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Luis Copetti", "telefone": "+5555999578900"}', true),
('vidaleve.barreiras@gmail.com', 'digital', 'Vidalevebarreiras', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Vidalevebarreiras", "telefone": "+5577990718683"}', true),
('selma.cordeiro@yahoo.com.br', 'digital', 'Selma Cordeiro Andrade', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', now(), now(), now(), '{"nome": "Selma Cordeiro Andrade", "telefone": "+5531996768650"}', true);

-- Atualizar contador de distribuição
UPDATE public.leads_distribuicao_controle 
SET contador_atual = 4, 
    ultima_distribuicao = now(), 
    updated_at = now();