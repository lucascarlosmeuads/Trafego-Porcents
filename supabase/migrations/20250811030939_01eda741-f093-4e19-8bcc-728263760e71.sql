
-- 1) Garantir Realtime completo nas tabelas
ALTER TABLE public.formularios_parceria REPLICA IDENTITY FULL;
ALTER TABLE public.kiwify_webhook_logs REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação do Realtime (com verificação segura)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'formularios_parceria'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.formularios_parceria';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'kiwify_webhook_logs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.kiwify_webhook_logs';
  END IF;
END $$;

-- 2) TRIGGER: Quando chegar um webhook "paid", atualizar o lead correspondente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_kiwify_webhook_approval'
      AND n.nspname = 'public'
      AND c.relname = 'kiwify_webhook_logs'
  ) THEN
    CREATE TRIGGER trg_kiwify_webhook_approval
    AFTER INSERT ON public.kiwify_webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.process_kiwify_webhook_approval();
  END IF;
END $$;

-- 3) TRIGGER: Atualizar updated_at ao editar leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_form_parceria_updated_at'
      AND n.nspname = 'public'
      AND c.relname = 'formularios_parceria'
  ) THEN
    CREATE TRIGGER trg_form_parceria_updated_at
    BEFORE UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.update_formularios_parceria_updated_at();
  END IF;
END $$;

-- 4) TRIGGER: Validar formulário (email, sanitização, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_form_parceria_validate'
      AND n.nspname = 'public'
      AND c.relname = 'formularios_parceria'
  ) THEN
    CREATE TRIGGER trg_form_parceria_validate
    BEFORE INSERT OR UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_partnership_form();
  END IF;
END $$;

-- 5) TRIGGER: Rate limit de submissões (antes de inserir lead)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_form_parceria_rate_limit'
      AND n.nspname = 'public'
      AND c.relname = 'formularios_parceria'
  ) THEN
    CREATE TRIGGER trg_form_parceria_rate_limit
    BEFORE INSERT ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.check_form_submission_rate();
  END IF;
END $$;

-- 6) TRIGGER: Distribuir novo lead automaticamente (apenas quando não pago)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_form_parceria_distribuir'
      AND n.nspname = 'public'
      AND c.relname = 'formularios_parceria'
  ) THEN
    CREATE TRIGGER trg_form_parceria_distribuir
    BEFORE INSERT ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.distribuir_novo_lead();
  END IF;
END $$;

-- 7) TRIGGER: Agendar recuperação (somente para leads não pagos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_form_parceria_schedule_recovery'
      AND n.nspname = 'public'
      AND c.relname = 'formularios_parceria'
  ) THEN
    CREATE TRIGGER trg_form_parceria_schedule_recovery
    AFTER INSERT ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.schedule_recovery_on_insert();
  END IF;
END $$;

-- 8) TRIGGER: Cancelar recuperação quando vira "comprou"/pago
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_form_parceria_cancel_recovery'
      AND n.nspname = 'public'
      AND c.relname = 'formularios_parceria'
  ) THEN
    CREATE TRIGGER trg_form_parceria_cancel_recovery
    AFTER UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.cancel_recovery_on_update();
  END IF;
END $$;

-- 9) TRIGGER: Quando status virar "comprou" e pago, criar cliente parceria e sinalizar criação do usuário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_form_parceria_process_payment'
      AND n.nspname = 'public'
      AND c.relname = 'formularios_parceria'
  ) THEN
    CREATE TRIGGER trg_form_parceria_process_payment
    AFTER INSERT OR UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.process_parceria_client_payment();
  END IF;
END $$;

-- 10) Índices para performance nas buscas por email e por data de compra
CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_email ON public.kiwify_webhook_logs (email_comprador);
CREATE INDEX IF NOT EXISTS idx_form_parceria_email ON public.formularios_parceria (email_usuario);
CREATE INDEX IF NOT EXISTS idx_form_parceria_data_compra ON public.formularios_parceria (data_compra);
