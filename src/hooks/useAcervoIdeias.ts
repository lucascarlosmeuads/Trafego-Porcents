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

  const processarBriefingsPendentes = async () => {
    try {
      setProcessing(true);
      
      // Buscar briefings que ainda não foram analisados
      const briefingsJaAnalisados = ideias.map(i => i.briefing_id);
      
      const { data: briefings, error: briefingsError } = await supabase
        .from('briefings_cliente')
        .select('id, email_cliente, nome_produto, created_at')
        .eq('formulario_completo', true)
        .not('id', 'in', `(${briefingsJaAnalisados.length > 0 ? briefingsJaAnalisados.map(id => `'${id}'`).join(',') : "'__NONE__'"})`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (briefingsError) throw briefingsError;

      if (!briefings || briefings.length === 0) {
        toast({
          title: "Nenhum briefing novo",
          description: "Todos os briefings já foram processados",
        });
        return;
      }

      let processados = 0;
      for (const briefing of briefings) {
        try {
          const { data, error } = await supabase.functions.invoke('analyze-business-idea', {
            body: { briefing_id: briefing.id }
          });

          if (error) throw error;
          if (data?.success) processados++;
          
        } catch (error) {
          console.error(`Erro ao processar briefing ${briefing.id}:`, error);
        }
      }

      toast({
        title: "Processamento concluído",
        description: `${processados} novas ideias foram analisadas e adicionadas ao acervo`,
      });

      // Recarregar ideias após processamento
      await fetchIdeias();
      
    } catch (error) {
      console.error('Erro ao processar briefings:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar briefings pendentes",
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
    atualizarStatusIdeia,
  };
};