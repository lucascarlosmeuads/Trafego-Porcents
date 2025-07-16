import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BatchProgress {
  total: number;
  completed: number;
  errors: number;
  current: string;
  processing: boolean;
}

interface BriefingToProcess {
  email_cliente: string;
  nome_produto: string;
}

export const useBatchPlanejamentoEstrategico = () => {
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    completed: 0,
    errors: 0,
    current: '',
    processing: false
  });
  
  const { toast } = useToast();

  const getBriefingsWithoutPlan = async (): Promise<BriefingToProcess[]> => {
    console.log('🔍 Buscando briefings sem planejamento...');
    
    const { data, error } = await supabase
      .from('briefings_cliente')
      .select('email_cliente, nome_produto')
      .eq('formulario_completo', true)
      .or('planejamento_estrategico.is.null,planejamento_estrategico.eq.');

    if (error) {
      console.error('Erro ao buscar briefings:', error);
      throw error;
    }

    console.log(`📊 Encontrados ${data?.length || 0} briefings sem planejamento`);
    return data || [];
  };

  const generateSinglePlan = async (emailCliente: string): Promise<boolean> => {
    try {
      console.log(`🚀 Gerando planejamento para: ${emailCliente}`);
      
      const { data, error } = await supabase.functions.invoke('generate-strategic-plan', {
        body: { emailCliente }
      });
      
      if (error) {
        console.error(`Erro para ${emailCliente}:`, error);
        return false;
      }
      
      if (data.success) {
        console.log(`✅ Sucesso para: ${emailCliente}`);
        return true;
      } else {
        console.error(`Falha para ${emailCliente}:`, data.error);
        return false;
      }
    } catch (error) {
      console.error(`Erro para ${emailCliente}:`, error);
      return false;
    }
  };

  const generateAllPlans = async () => {
    try {
      setProgress(prev => ({ ...prev, processing: true }));
      
      // Buscar todos os briefings sem planejamento
      const briefings = await getBriefingsWithoutPlan();
      
      if (briefings.length === 0) {
        toast({
          title: "Nenhum planejamento pendente",
          description: "Todos os briefings completos já possuem planejamento estratégico!",
        });
        setProgress(prev => ({ ...prev, processing: false }));
        return;
      }

      // Inicializar progresso
      setProgress({
        total: briefings.length,
        completed: 0,
        errors: 0,
        current: '',
        processing: true
      });

      toast({
        title: "Iniciando geração em lote",
        description: `Processando ${briefings.length} planejamentos estratégicos...`,
      });

      let completed = 0;
      let errors = 0;

      // Processar um por vez para não sobrecarregar
      for (const briefing of briefings) {
        setProgress(prev => ({
          ...prev,
          current: briefing.nome_produto
        }));

        const success = await generateSinglePlan(briefing.email_cliente);
        
        if (success) {
          completed++;
        } else {
          errors++;
        }

        setProgress(prev => ({
          ...prev,
          completed: completed,
          errors: errors
        }));

        // Pequena pausa entre requests para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Relatório final
      const successRate = Math.round((completed / briefings.length) * 100);
      
      toast({
        title: "Geração concluída!",
        description: `${completed} planejamentos gerados com sucesso (${successRate}%). ${errors} erros.`,
        variant: errors > 0 ? "destructive" : "default"
      });

      setProgress({
        total: briefings.length,
        completed,
        errors,
        current: '',
        processing: false
      });

    } catch (error: any) {
      console.error("Erro na geração em lote:", error);
      toast({
        title: "Erro na geração em lote",
        description: "Erro ao processar planejamentos. Tente novamente.",
        variant: "destructive"
      });
      
      setProgress(prev => ({ ...prev, processing: false }));
    }
  };

  const resetProgress = () => {
    setProgress({
      total: 0,
      completed: 0,
      errors: 0,
      current: '',
      processing: false
    });
  };

  return {
    progress,
    generateAllPlans,
    resetProgress,
    getBriefingsWithoutPlan
  };
};