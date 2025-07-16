import { supabase } from '@/integrations/supabase/client';

export const executeBulkPlanGeneration = async () => {
  console.log('🚀 Iniciando geração em massa de planejamentos...');
  
  try {
    const { data, error } = await supabase.functions.invoke('bulk-generate-plans', {
      body: {}
    });
    
    if (error) {
      console.error('Erro na geração em massa:', error);
      throw error;
    }
    
    console.log('📊 Resultado da geração em massa:', data);
    return data;
    
  } catch (error) {
    console.error('Erro ao executar geração em massa:', error);
    throw error;
  }
};

// Executar automaticamente quando importado (para teste rápido)
if (typeof window !== 'undefined') {
  // @ts-ignore - Para debug direto no console
  window.executeBulkPlanGeneration = executeBulkPlanGeneration;
}