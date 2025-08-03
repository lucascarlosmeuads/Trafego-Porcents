import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enableRealtimeForTable } from '@/utils/realtimeUtils';

interface LeadParceria {
  id: string;
  created_at: string;
  tipo_negocio: string;
  email_usuario: string | null;
  planejamento_estrategico: string | null;
  respostas: any;
  completo: boolean;
  updated_at: string;
  audio_visao_futuro: string | null;
  produto_descricao: string | null;
  valor_medio_produto: number | null;
  ja_teve_vendas: boolean | null;
  visao_futuro_texto: string | null;
}

export function useLeadsParceria() {
  const [leads, setLeads] = useState<LeadParceria[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      // Habilitar realtime para a tabela
      await enableRealtimeForTable('formularios_parceria');

      // Buscar todos os leads
      const { data, error, count } = await supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLeads((data || []) as LeadParceria[]);
      setTotalLeads(count || 0);
    } catch (err: any) {
      console.error('Erro ao buscar leads de parceria:', err);
      setError(err.message || 'Erro ao carregar os leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Configurar escuta de eventos em tempo real
    const channel = supabase
      .channel('formularios_parceria_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'formularios_parceria',
        },
        () => {
          // Quando houver qualquer mudança, recarregar os dados
          fetchLeads();
        }
      )
      .subscribe();

    // Limpar a inscrição quando o componente for desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refetch = () => {
    fetchLeads();
  };

  return {
    leads,
    totalLeads,
    loading,
    error,
    refetch,
  };
}