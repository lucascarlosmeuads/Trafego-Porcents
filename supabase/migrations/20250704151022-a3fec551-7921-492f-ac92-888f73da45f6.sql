
-- Adicionar novos campos para as etapas 2 e 3 do formulário de gestão de tráfego
ALTER TABLE public.briefings_cliente 
ADD COLUMN direcionamento_campanha text DEFAULT NULL,
ADD COLUMN abrangencia_atendimento text DEFAULT NULL,
ADD COLUMN possui_facebook boolean DEFAULT NULL,
ADD COLUMN possui_instagram boolean DEFAULT NULL,
ADD COLUMN utiliza_whatsapp_business boolean DEFAULT NULL,
ADD COLUMN criativos_prontos boolean DEFAULT NULL,
ADD COLUMN videos_prontos boolean DEFAULT NULL,
ADD COLUMN cores_desejadas text DEFAULT NULL,
ADD COLUMN tipo_fonte text DEFAULT NULL,
ADD COLUMN cores_proibidas text DEFAULT NULL,
ADD COLUMN fonte_especifica text DEFAULT NULL,
ADD COLUMN estilo_visual text DEFAULT NULL,
ADD COLUMN tipos_imagens_preferidas text[] DEFAULT NULL,
ADD COLUMN etapa_atual integer DEFAULT 1,
ADD COLUMN formulario_completo boolean DEFAULT false;
