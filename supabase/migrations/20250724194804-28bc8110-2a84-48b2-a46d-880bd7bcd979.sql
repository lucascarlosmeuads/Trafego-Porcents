-- Remover o trigger problemático temporariamente
DROP TRIGGER IF EXISTS set_default_commission_trigger ON public.todos_clientes;

-- Recriar a função sem a inserção na chat_atendentes
CREATE OR REPLACE FUNCTION public.set_default_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Se valor_comissao não foi fornecido ou é NULL, definir como 60.00
  IF NEW.valor_comissao IS NULL THEN
    NEW.valor_comissao := 60.00;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger sem problemas
CREATE TRIGGER set_default_commission_trigger
  BEFORE INSERT ON public.todos_clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_commission();