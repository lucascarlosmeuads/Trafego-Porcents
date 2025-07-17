import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IdeiaItem {
  id: string;
  email_cliente: string;
  briefing_id: string;
  titulo_ideia: string;
  descricao_projeto: string;
  produto_servico: string;
  publico_alvo: string;
  dores_identificadas: string[];
  diferenciais: string;
  categoria_negocio: string;
  potencial_mercado: string;
  investimento_sugerido: number;
  status_analise: string;
  insights_ia: any;
  created_at: string;
  updated_at: string;
}

export const useAcervoIdeias = () => {
  const [ideias, setIdeias] = useState<IdeiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchIdeias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideias_negocio')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeias(data || []);
    } catch (error) {
      console.error('Erro ao buscar ideias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar acervo de ideias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processarBriefingsPendentes = async (limiteBatch = 20) => {
    try {
      setProcessing(true);
      
      // Primeiro, buscar todos os briefings já analisados
      const { data: ideiasExistentes } = await supabase
        .from('ideias_negocio')
        .select('briefing_id');
      
      const briefingsJaAnalisados = ideiasExistentes?.map(i => i.briefing_id) || [];
      
      console.log('🔍 Briefings já analisados:', briefingsJaAnalisados.length);
      
      // Buscar briefings completos que não foram analisados
      let query = supabase
        .from('briefings_cliente')
        .select('id, email_cliente, nome_produto, created_at')
        .eq('formulario_completo', true)
        .order('created_at', { ascending: false })
        .limit(limiteBatch);
      
      // Se há briefings já analisados, excluí-los
      if (briefingsJaAnalisados.length > 0) {
        query = query.not('id', 'in', `(${briefingsJaAnalisados.map(id => `'${id}'`).join(',')})`);
      }
      
      const { data: briefings, error: briefingsError } = await query;

      if (briefingsError) throw briefingsError;

      console.log('📋 Briefings encontrados para processar:', briefings?.length || 0);

      if (!briefings || briefings.length === 0) {
        toast({
          title: "Nenhum briefing novo",
          description: "Todos os briefings já foram processados",
        });
        return { processados: 0, total: 0 };
      }

      let processados = 0;
      let tentativas = 0;
      
      for (const briefing of briefings) {
        tentativas++;
        try {
          console.log(`🔄 Processando ${tentativas}/${briefings.length}: ${briefing.nome_produto}`);
          
          const { data, error } = await supabase.functions.invoke('analyze-business-idea', {
            body: { briefing_id: briefing.id }
          });

          if (error) {
            console.error(`❌ Erro na edge function para ${briefing.id}:`, error);
            throw error;
          }
          
          if (data?.success) {
            processados++;
            console.log(`✅ Briefing processado com sucesso: ${briefing.nome_produto}`);
          } else {
            console.warn(`⚠️ Processamento falhou para ${briefing.id}:`, data);
          }
          
          // Pequena pausa entre requisições para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Erro ao processar briefing ${briefing.id}:`, error);
        }
      }

      const message = processados > 0 
        ? `${processados} novas ideias foram analisadas e adicionadas ao acervo`
        : `Tentativa de processar ${tentativas} briefings, mas ${processados} foram bem-sucedidos`;

      toast({
        title: "Processamento concluído",
        description: message,
        variant: processados > 0 ? "default" : "destructive"
      });

      // Recarregar ideias após processamento
      await fetchIdeias();
      
      return { processados, total: briefings.length };
      
    } catch (error) {
      console.error('❌ Erro geral ao processar briefings:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar briefings pendentes",
        variant: "destructive",
      });
      return { processados: 0, total: 0 };
    } finally {
      setProcessing(false);
    }
  };

  const processarTodosBriefings = async (onProgress?: (current: number, total: number) => void) => {
    try {
      setProcessing(true);
      
      // Contar todos os briefings pendentes
      const { data: ideiasExistentes } = await supabase
        .from('ideias_negocio')
        .select('briefing_id');
      
      const briefingsJaAnalisados = ideiasExistentes?.map(i => i.briefing_id) || [];
      
      let query = supabase
        .from('briefings_cliente')
        .select('id')
        .eq('formulario_completo', true);
      
      if (briefingsJaAnalisados.length > 0) {
        query = query.not('id', 'in', `(${briefingsJaAnalisados.map(id => `'${id}'`).join(',')})`);
      }
      
      const { data: todosBriefings, error } = await query;
      
      if (error) throw error;
      
      const totalPendentes = todosBriefings?.length || 0;
      
      if (totalPendentes === 0) {
        toast({
          title: "Processamento completo",
          description: "Todos os briefings já foram processados",
        });
        return;
      }

      console.log(`🎯 Iniciando processamento de ${totalPendentes} briefings pendentes`);
      
      let totalProcessados = 0;
      let loteAtual = 1;
      const tamanhoBatch = 15; // Lotes menores para melhor controle
      
      // Processar em lotes
      while (totalProcessados < totalPendentes) {
        console.log(`📦 Processando lote ${loteAtual}...`);
        
        onProgress?.(totalProcessados, totalPendentes);
        
        const resultado = await processarBriefingsPendentes(tamanhoBatch);
        
        totalProcessados += resultado.processados;
        
        // Se não processou nenhum no lote, interromper
        if (resultado.processados === 0) {
          console.log('⚠️ Nenhum briefing processado no lote, interrompendo...');
          break;
        }
        
        loteAtual++;
        
        // Pausa maior entre lotes
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      onProgress?.(totalProcessados, totalPendentes);
      
      toast({
        title: "Processamento completo!",
        description: `${totalProcessados} ideias foram processadas de ${totalPendentes} briefings pendentes`,
      });
      
    } catch (error) {
      console.error('❌ Erro no processamento em lote:', error);
      toast({
        title: "Erro",
        description: "Erro no processamento em lote",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const atualizarStatusIdeia = async (ideiaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('ideias_negocio')
        .update({ status_analise: novoStatus })
        .eq('id', ideiaId);

      if (error) throw error;

      // Atualizar estado local
      setIdeias(prev => prev.map(ideia => 
        ideia.id === ideiaId 
          ? { ...ideia, status_analise: novoStatus }
          : ideia
      ));

      toast({
        title: "Status atualizado",
        description: `Ideia marcada como ${novoStatus}`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchIdeias();
  }, []);

  // Estatísticas
  const stats = {
    total: ideias.length,
    analisadas: ideias.filter(i => i.status_analise === 'analisado').length,
    aprovadas: ideias.filter(i => i.status_analise === 'aprovado').length,
    pendentes: ideias.filter(i => i.status_analise === 'pendente').length,
    altoPotencial: ideias.filter(i => i.potencial_mercado === 'Alto').length,
    categorias: [...new Set(ideias.map(i => i.categoria_negocio).filter(Boolean))],
  };

  return {
    ideias,
    loading,
    processing,
    stats,
    fetchIdeias,
    processarBriefingsPendentes,
    processarTodosBriefings,
    atualizarStatusIdeia,
  };
};