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
  cliente_pago: boolean;
  contatado_whatsapp: boolean;
  status_negociacao: 'pendente' | 'aceitou' | 'recusou' | 'pensando';
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

  const updateLeadStatus = async (leadId: string, field: 'cliente_pago' | 'contatado_whatsapp', value: boolean) => {
    try {
      const { error } = await supabase
        .from('formularios_parceria')
        .update({ [field]: value })
        .eq('id', leadId);

      if (error) throw error;
      
      // Atualizar estado local imediatamente
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, [field]: value } : lead
      ));
    } catch (err: any) {
      console.error(`Erro ao atualizar ${field}:`, err);
      setError(err.message);
    }
  };

  const updateLeadNegociacao = async (leadId: string, status: 'pendente' | 'aceitou' | 'recusou' | 'pensando') => {
    try {
      const updates: any = { status_negociacao: status };
      
      // Se aceitou, marcar como pago automaticamente
      if (status === 'aceitou') {
        updates.cliente_pago = true;
      }

      const { error } = await supabase
        .from('formularios_parceria')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;
      
      // Atualizar estado local imediatamente
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));
    } catch (err: any) {
      console.error('Erro ao atualizar status de negociação:', err);
      setError(err.message);
    }
  };

  const refetch = () => {
    fetchLeads();
  };

  return {
    leads,
    totalLeads,
    loading,
    error,
    refetch,
    updateLeadStatus,
    updateLeadNegociacao,
  };
}