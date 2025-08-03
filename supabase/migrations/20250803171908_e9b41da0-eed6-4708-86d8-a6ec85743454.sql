-- Adicionar novos campos para controle de status dos leads de parceria
ALTER TABLE public.formularios_parceria 
ADD COLUMN cliente_pago boolean DEFAULT false,
ADD COLUMN contatado_whatsapp boolean DEFAULT false,
ADD COLUMN status_negociacao text DEFAULT 'pendente' CHECK (status_negociacao IN ('pendente', 'aceitou', 'recusou', 'pensando'));