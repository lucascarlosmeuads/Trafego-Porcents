
-- Criar política específica para clientes atualizarem sua própria comissão
CREATE POLICY "Clientes podem atualizar sua própria comissão"
ON public.todos_clientes
FOR UPDATE
TO authenticated
USING (email_cliente = auth.email())
WITH CHECK (email_cliente = auth.email());

-- Garantir que a política permite apenas campos específicos de comissão
-- (O PostgreSQL não suporta restrição de campos diretamente na política RLS,
-- mas a aplicação controlará quais campos são atualizados)
