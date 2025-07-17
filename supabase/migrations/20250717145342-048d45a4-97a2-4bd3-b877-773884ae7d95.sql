-- Criar função para processar briefing automaticamente
CREATE OR REPLACE FUNCTION process_new_briefing()
RETURNS TRIGGER AS $$
BEGIN
  -- Só processar se o briefing foi marcado como completo
  IF NEW.formulario_completo = true AND (OLD.formulario_completo IS NULL OR OLD.formulario_completo = false) THEN
    -- Usar pg_notify para sinalizar que um novo briefing precisa ser processado
    PERFORM pg_notify('new_briefing_channel', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para chamar a função quando briefing for atualizado
CREATE TRIGGER trigger_process_new_briefing
  AFTER UPDATE ON public.briefings_cliente
  FOR EACH ROW
  EXECUTE FUNCTION process_new_briefing();