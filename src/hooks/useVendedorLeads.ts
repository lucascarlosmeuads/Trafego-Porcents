import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enableRealtimeForTable } from '@/utils/realtimeUtils';
import { useAuth } from '@/hooks/useAuth';

interface LeadParceria {
  id: string;
  created_at: string;
  data_compra?: string | null;
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
  webhook_data_compra?: string | null;
}


export function useVendedorLeads() {
  const [leads, setLeads] = useState<LeadParceria[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.email) {
        setLeads([]);
        setTotalLeads(0);
        return;
      }

      // Habilitar realtime para as tabelas necessárias
      await enableRealtimeForTable('formularios_parceria');
      await enableRealtimeForTable('kiwify_webhook_logs');

      // Buscar apenas leads atribuídos ao vendedor logado
      const { data, error, count } = await supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact' })
        .eq('vendedor_responsavel', user.email)
        .range(0, 4999)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Buscar logs de webhook para identificar vendas automáticas
      const { data: webhookLogs } = await supabase
        .from('kiwify_webhook_logs')
        .select('email_comprador, webhook_data')
        .eq('status_processamento', 'sucesso')
        .eq('lead_encontrado', true);

      // Mapear leads com informação de webhook automático
      const leadsWithWebhookInfo = (data || []).map(lead => {
        const webhookLog = webhookLogs?.find(log => {
          const webhookData = log.webhook_data as any;
          return log.email_comprador === lead.email_usuario &&
            webhookData?.webhook_event_type === 'order_approved' &&
            webhookData?.order_status === 'paid';
        });
        
        return {
          ...lead,
          webhook_automatico: !!webhookLog
        };
      });

      setLeads(leadsWithWebhookInfo as LeadParceria[]);
      setTotalLeads(count || 0);
    } catch (err: any) {
      console.error('Erro ao buscar leads do vendedor:', err);
      setError(err.message || 'Erro ao carregar os leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Realtime: mudanças no formulário
    const formsChannel = supabase
      .channel('vendedor_leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'formularios_parceria',
        },
        () => {
          console.log('📡 Realtime vendedor: mudança em formularios_parceria -> refetch');
          fetchLeads();
        }
      )
      .subscribe();

    // Realtime: novos webhooks (pagos) chegando
    const webhookChannel = supabase
      .channel('vendedor_webhook_inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kiwify_webhook_logs',
        },
        (payload) => {
          const email = (payload?.new as any)?.email_comprador;
          console.log('🧲 Realtime vendedor: novo webhook recebido para', email, '-> refetch');
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(formsChannel);
      supabase.removeChannel(webhookChannel);
    };
  }, [user?.email]);

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
      
      // Se comprou, marcar como pago automaticamente e registrar data_compra
      if (status === 'comprou') {
        updates.cliente_pago = true;
        updates.data_compra = new Date().toISOString();
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
