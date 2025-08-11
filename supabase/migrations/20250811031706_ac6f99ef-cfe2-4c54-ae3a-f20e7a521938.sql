
-- 1) Garantir que atualizações emitam payload completo para realtime
ALTER TABLE public.formularios_parceria REPLICA IDENTITY FULL;

-- 2) Incluir tabelas na publicação realtime, se ainda não estiverem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'formularios_parceria'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.formularios_parceria;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'kiwify_webhook_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kiwify_webhook_logs;
  END IF;
END
$$;

-- 3) Criar índices para performance nas consultas de vendas por data e por email
CREATE INDEX IF NOT EXISTS idx_form_parceria_data_compra ON public.formularios_parceria (data_compra);
CREATE INDEX IF NOT EXISTS idx_form_parceria_email_usuario ON public.formularios_parceria (email_usuario);
CREATE INDEX IF NOT EXISTS idx_kiwify_logs_email ON public.kiwify_webhook_logs (email_comprador);

-- 4) Trigger para manter updated_at dos leads sempre correto (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_form_parceria_updated_at'
  ) THEN
    CREATE TRIGGER trg_form_parceria_updated_at
    BEFORE UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.update_formularios_parceria_updated_at();
  END IF;
END
$$;

-- 5) Trigger para processar automaticamente webhooks Kiwify "paid" e atualizar lead
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_process_kiwify_webhook_approval'
  ) THEN
    CREATE TRIGGER trg_process_kiwify_webhook_approval
    AFTER INSERT ON public.kiwify_webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.process_kiwify_webhook_approval();
  END IF;
END
$$;
