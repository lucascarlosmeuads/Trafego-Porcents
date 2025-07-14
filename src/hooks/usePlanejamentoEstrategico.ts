import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePlanejamentoEstrategico = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePlanejamento = async (emailCliente: string) => {
    setIsGenerating(true);
    
    try {
      console.log('🚀 Iniciando geração de planejamento para:', emailCliente);
      
      const { data, error } = await supabase.functions.invoke('generate-strategic-plan', {
        body: { emailCliente }
      });
      
      if (error) {
        console.error('Erro na edge function:', error);
        throw error;
      }
      
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: "Planejamento estratégico gerado com sucesso!",
        });
        return { success: true, planejamento: data.planejamento };
      } else {
        throw new Error(data.error || "Erro ao gerar planejamento");
      }
    } catch (error: any) {
      console.error("Erro ao gerar planejamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar planejamento estratégico. Tente novamente.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePlanejamento,
    isGenerating
  };
};