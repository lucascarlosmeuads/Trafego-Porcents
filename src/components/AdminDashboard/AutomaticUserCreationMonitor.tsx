import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AutomaticUserCreationMonitor() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingTrigger, setIsTestingTrigger] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Buscar logs recentes
  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('client_user_creation_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Testar trigger simulando pagamento
  const testTrigger = async () => {
    setIsTestingTrigger(true);
    try {
      console.log('🧪 Testando trigger automático...');
      
      // Simular atualização de status para disparar trigger
      const testEmail = `teste-${Date.now()}@exemplo.com`;
      
      // Primeiro inserir formulário
      const { data: novoForm, error: insertError } = await supabase
        .from('formularios_parceria')
        .insert({
          email_usuario: testEmail,
          tipo_negocio: 'teste',
          respostas: { nome: 'Cliente Teste', telefone: '11999999999' },
          completo: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Agora simular pagamento (isso deve disparar o trigger)
      const { error: updateError } = await supabase
        .from('formularios_parceria')
        .update({
          status_negociacao: 'aceitou',
          cliente_pago: true
        })
        .eq('id', novoForm.id);

      if (updateError) throw updateError;

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verificar se usuário foi criado
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const createdUser = authUsers.users?.find((u: any) => u.email === testEmail);
      
      // Verificar se cliente parceria foi criado
      const { data: clienteParceria } = await supabase
        .from('clientes_parceria')
        .select('*')
        .eq('email_cliente', testEmail)
        .single();

      const result = {
        formulario_criado: true,
        pagamento_simulado: true,
        usuario_auth_criado: !!createdUser,
        cliente_parceria_criado: !!clienteParceria,
        email_teste: testEmail,
        user_id: createdUser?.id,
        timestamp: new Date().toISOString()
      };

      setTestResult(result);
      fetchLogs(); // Atualizar logs

      if (result.usuario_auth_criado && result.cliente_parceria_criado) {
        toast.success('✅ Trigger automático funcionando perfeitamente!');
      } else {
        toast.error('❌ Trigger automático falhou - verificar logs');
      }

      // Limpar dados de teste
      try {
        if (createdUser?.id) {
          await supabase.auth.admin.deleteUser(createdUser.id);
        }
        await supabase.from('formularios_parceria').delete().eq('id', novoForm.id);
        await supabase.from('clientes_parceria').delete().eq('email_cliente', testEmail);
      } catch (cleanupError) {
        console.warn('Erro na limpeza dos dados de teste:', cleanupError);
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast.error(`Erro no teste: ${error.message}`);
      setTestResult({ 
        erro: true, 
        mensagem: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingTrigger(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Monitor de Criação Automática</h3>
      
      <div className="space-y-4">
        <Button 
          onClick={testTrigger}
          disabled={isTestingTrigger}
          variant="outline"
        >
          {isTestingTrigger ? 'Testando...' : 'Testar Trigger Automático'}
        </Button>

        <Button 
          onClick={fetchLogs}
          variant="outline"
        >
          Atualizar Logs
        </Button>

        {testResult && (
          <div className="p-4 bg-muted rounded">
            <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {logs.length > 0 && (
          <div className="p-4 bg-muted rounded">
            <h4 className="font-semibold mb-2">Logs Recentes:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="text-sm p-2 bg-background rounded">
                  <div className="font-medium">{log.email_cliente}</div>
                  <div className="text-muted-foreground">{log.operation_type}</div>
                  <div className="text-xs">{log.result_message}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}