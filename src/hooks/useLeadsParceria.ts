import { useState, useEffect, useMemo } from 'react';
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
  status_negociacao: 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago';
  vendedor_responsavel: string | null;
  distribuido_em: string | null;
  webhook_automatico?: boolean;
  precisa_mais_info?: boolean;
}

export function useLeadsParceria(dateFilter?: { startDate?: string; endDate?: string; option?: string }) {
  const [leads, setLeads] = useState<LeadParceria[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the filter to prevent unnecessary re-renders
  const stableFilter = useMemo(() => dateFilter, [
    dateFilter?.startDate, 
    dateFilter?.endDate, 
    dateFilter?.option
  ]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      // Habilitar realtime para a tabela
      await enableRealtimeForTable('formularios_parceria');

      // Buscar leads com informação se foi via webhook
      let leadsQuery = supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact' });

      // Aplicar filtro de data se fornecido
      if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
        leadsQuery = leadsQuery
          .gte('created_at', `${dateFilter.startDate}T00:00:00`)
          .lte('created_at', `${dateFilter.endDate}T23:59:59`);
      }

      const { data: leadsData, error: leadsError, count } = await leadsQuery.order('created_at', { ascending: false });

      if (leadsError) {
        throw leadsError;
      }

      // Buscar logs de webhook para determinar quais foram automáticos
      const { data: webhookLogs } = await supabase
        .from('kiwify_webhook_logs')
        .select('email_comprador, status_processamento')
        .eq('status_processamento', 'sucesso');

      // Criar set de emails que foram processados via webhook
      const emailsWebhook = new Set(
        (webhookLogs || []).map(log => log.email_comprador)
      );

      // Processar leads para incluir flag de webhook automático
      const processedLeads = (leadsData || []).map(lead => ({
        ...lead,
        webhook_automatico: emailsWebhook.has(lead.email_usuario)
      }));

      setLeads(processedLeads as LeadParceria[]);
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
  }, [stableFilter]);

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

  const updateLeadNegociacao = async (leadId: string, status: 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago') => {
    try {
      const updates: any = { status_negociacao: status };
      
      // Se comprou, marcar como pago automaticamente
      if (status === 'comprou') {
        updates.cliente_pago = true;
      }
      
      // Se voltou para lead, resetar o status de pago (exceto se foi marcado manualmente)
      if (status === 'lead') {
        updates.cliente_pago = false;
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

  const reatribuirLead = async (leadId: string, novoVendedor: string | null) => {
    try {
      const updates: any = { 
        vendedor_responsavel: novoVendedor,
        distribuido_em: novoVendedor ? new Date().toISOString() : null 
      };

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
      console.error('Erro ao reatribuir lead:', err);
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
    reatribuirLead,
  };
}