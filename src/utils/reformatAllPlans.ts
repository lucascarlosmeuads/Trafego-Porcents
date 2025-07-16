import { supabase } from '@/integrations/supabase/client';

export const executeReformatAllPlans = async () => {
  console.log('🎨 Iniciando reformatação de todos os planejamentos existentes...');
  
  try {
    const { data, error } = await supabase.functions.invoke('reformat-existing-plans', {
      body: {}
    });
    
    if (error) {
      console.error('Erro na reformatação:', error);
      throw error;
    }
    
    console.log('📊 Resultado da reformatação:', data);
    return data;
    
  } catch (error) {
    console.error('Erro ao executar reformatação:', error);
    throw error;
  }
};

// Executar automaticamente quando importado (para teste rápido)
if (typeof window !== 'undefined') {
  // @ts-ignore - Para debug direto no console
  window.executeReformatAllPlans = executeReformatAllPlans;
}