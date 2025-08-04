import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function BulkCreateParceiraUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const executeBulkCreate = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Executando bulk-create-parceria-users...');
      
      const { data, error } = await supabase.functions.invoke('bulk-create-parceria-users', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro ao executar função:', error);
        toast.error(`Erro: ${error.message}`);
        return;
      }

      console.log('✅ Resultado da execução:', data);
      setResult(data);
      
      if (data.sucessos > 0) {
        toast.success(`✅ ${data.sucessos} usuários criados com sucesso!`);
      }
      
      if (data.falhas > 0) {
        toast.error(`❌ ${data.falhas} falhas na criação`);
      }

    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast.error('Erro ao executar função');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Criar Usuários Auth em Massa</h3>
      
      <Button 
        onClick={executeBulkCreate}
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Executando...' : 'Executar Criação em Massa'}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-muted rounded">
          <h4 className="font-semibold">Resultado:</h4>
          <pre className="text-sm mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}