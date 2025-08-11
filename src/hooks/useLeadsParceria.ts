
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enableRealtimeForTable } from '@/utils/realtimeUtils';

interface LeadParceria {
  id: string;
  created_at: string;
  data_compra: string | null;
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
  webhook_data_compra?: string | null;
}

export function useLeadsParceria(dateFilter?: { startDate?: string; endDate?: string; option?: string }) {
  const [leads, setLeads] = useState<LeadParceria[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetchTimer = useRef<number | null>(null);

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
      const columns = 'id, created_at, data_compra, tipo_negocio, email_usuario, planejamento_estrategico, respostas, completo, updated_at, audio_visao_futuro, produto_descricao, valor_medio_produto, ja_teve_vendas, visao_futuro_texto, cliente_pago, contatado_whatsapp, status_negociacao, vendedor_responsavel, distribuido_em, precisa_mais_info';

      // 1) Buscar apenas a contagem total com o mesmo filtro (por created_at)
      let countQuery = supabase
        .from('formularios_parceria')
        .select('id', { count: 'exact', head: true });

      if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
        countQuery = countQuery
          .gte('created_at', `${dateFilter.startDate}T00:00:00`)
          .lte('created_at', `${dateFilter.endDate}T23:59:59`);
      }

      const { count: total, error: countError } = await countQuery;
      if (countError) throw countError;

      const totalToFetch = total || 0;
      const pageSize = 1000;

      // 2) Buscar todas as páginas em paralelo respeitando o filtro por created_at
      const pagePromises: any[] = [];
      if (totalToFetch > 0) {
        const pages = Math.ceil(totalToFetch / pageSize);
        for (let i = 0; i < pages; i++) {
          const from = i * pageSize;
          const to = Math.min(from + pageSize - 1, totalToFetch - 1);

          let pageQuery = supabase
            .from('formularios_parceria')
            .select(columns)
            .order('created_at', { ascending: false })
            .range(from, to);

          if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
            pageQuery = pageQuery
              .gte('created_at', `${dateFilter.startDate}T00:00:00`)
              .lte('created_at', `${dateFilter.endDate}T23:59:59`);
          }

          pagePromises.push(pageQuery);
        }
      }

      const pageResults = await Promise.all(pagePromises);
      const pageErrors = pageResults.map(r => (r as any).error).filter(Boolean);
      if (pageErrors.length > 0) {
        throw pageErrors[0];
      }

      const leadsData = pageResults.flatMap(r => ((r as any).data || []));

      // 3) Buscar logs de webhook relevantes em lotes para evitar limites de URL
      const normalizeEmail = (e: any) => {
        if (typeof e !== 'string') return '';
        // Normalização robusta: corrigir typos comuns e limpar formato
        return e.trim().toLowerCase()
          .replace('hotmil.com', 'hotmail.com')
          .replace('gmai.com', 'gmail.com')
          .replace('outlok.com', 'outlook.com')
          .replace(/\s+/g, '');
      };
      
      const findSimilarEmail = (searchEmail: string, emailList: string[]): string | null => {
        const normalized = normalizeEmail(searchEmail);
        if (!normalized) return null;
        
        // Busca exata primeiro
        const exact = emailList.find(e => normalizeEmail(e) === normalized);
        if (exact) return exact;
        
        // Busca por similaridade (diferença de 1-2 caracteres)
        const [user, domain] = normalized.split('@');
        if (!user || !domain) return null;
        
        for (const email of emailList) {
          const normEmail = normalizeEmail(email);
          const [emailUser, emailDomain] = normEmail.split('@');
          if (!emailUser || !emailDomain) continue;
          
          // Mesmo domínio, usuário similar
          if (emailDomain === domain && Math.abs(emailUser.length - user.length) <= 2) {
            let diffs = 0;
            const minLen = Math.min(emailUser.length, user.length);
            for (let i = 0; i < minLen; i++) {
              if (emailUser[i] !== user[i]) diffs++;
              if (diffs > 2) break;
            }
            if (diffs <= 2) return email;
          }
        }
        return null;
      };
      
      const leadEmailsRaw = (leadsData || [])
        .map((l: any) => l.email_usuario)
        .filter((e: any) => typeof e === 'string' && e.length > 0);

      let emailsWebhookNormalized = new Set<string>();
      const emailToWebhookDate = new Map<string, string>();
      if (leadEmailsRaw.length > 0) {
        const chunkSize = 300;
        const chunks: string[][] = [];
        for (let i = 0; i < leadEmailsRaw.length; i += chunkSize) {
          chunks.push(leadEmailsRaw.slice(i, i + chunkSize));
        }

        const webhookPromises: any[] = chunks.map(chunk =>
          supabase
            .from('kiwify_webhook_logs')
            .select('email_comprador, webhook_data, created_at, status_processamento')
            .in('email_comprador', chunk)
        );

        try {
          const webhookResults = await Promise.all(webhookPromises);
          const webhookErrors = webhookResults.map(r => (r as any).error).filter(Boolean);
          if (webhookErrors.length === 0) {
            const webhookData = webhookResults.flatMap(r => ((r as any).data || []));
            // Mapear email normalizado -> última data de compra extraída do payload do webhook
            const extractDateIso = (...vals: any[]) => {
              for (const v of vals) {
                if (v && typeof v === 'string' && v.trim().length > 0) {
                  const d = new Date(v);
                  if (!isNaN(d.getTime())) return d.toISOString();
                }
              }
              return null as string | null;
            };
            for (const log of webhookData) {
              const wd = log?.webhook_data || {};
              const statusStr = (wd?.order_status || wd?.status || '').toString().toLowerCase();
              const isPaidEvent = statusStr === 'paid' || !!(wd?.approved_at || wd?.paid_at || wd?.order?.approved_at || wd?.order?.paid_at || wd?.data?.approved_at || wd?.data?.paid_at);
              if (!isPaidEvent) continue;
              const dt = extractDateIso(
                wd?.approved_at,
                wd?.paid_at,
                wd?.order?.approved_at,
                wd?.order?.paid_at,
                wd?.data?.approved_at,
                wd?.data?.paid_at,
              ) || (log?.created_at ? new Date(log.created_at).toISOString() : null);
              if (!dt) continue;
              const rawEmail = log?.email_comprador as string | undefined;
              if (!rawEmail) continue;
              const emailNorm = normalizeEmail(rawEmail);
              const prev = emailToWebhookDate.get(emailNorm);
              if (!prev || new Date(dt).getTime() > new Date(prev).getTime()) {
                emailToWebhookDate.set(emailNorm, dt);
              }
            }
            emailsWebhookNormalized = new Set(Array.from(emailToWebhookDate.keys()));
          } else {
            console.warn('Ignorando erros ao buscar logs Kiwify:', webhookErrors[0]);
          }
        } catch (we) {
          console.warn('Falha ao buscar logs Kiwify, seguiremos sem enriquecimento:', we);
        }
      }

      // 4) Processar leads para incluir flag de webhook automático e data do webhook, e auto-sync quando necessário
      const processedLeads = (leadsData || []).map((lead: any) => {
        const emailNorm = normalizeEmail(lead.email_usuario);
        let webhookDate = emailNorm ? (emailToWebhookDate.get(emailNorm) || null) : null;
        let isWebhookMatch = emailNorm ? emailsWebhookNormalized.has(emailNorm) : false;
        
        // Se não encontrou match direto, tenta busca por similaridade
        if (!isWebhookMatch && emailNorm) {
          const webhookEmails = Array.from(emailsWebhookNormalized);
          const similarEmail = findSimilarEmail(emailNorm, webhookEmails);
          if (similarEmail) {
            isWebhookMatch = true;
            webhookDate = emailToWebhookDate.get(normalizeEmail(similarEmail)) || null;
          }
        }
        
        // Sincronização automática de status
        let updatedLead = { ...lead };
        if (isWebhookMatch && webhookDate && !lead.cliente_pago) {
          updatedLead = {
            ...updatedLead,
            cliente_pago: true,
            status_negociacao: 'comprou',
            data_compra: webhookDate
          };
          
          // Atualizar no banco (silent update)
          (async () => {
            try {
              await supabase
                .from('formularios_parceria')
                .update({ 
                  cliente_pago: true, 
                  status_negociacao: 'comprou',
                  data_compra: webhookDate 
                })
                .eq('id', lead.id);
              console.log('✅ Auto-sync:', lead.email_usuario);
            } catch (err: any) {
              console.warn('⚠️ Auto-sync failed:', err);
            }
          })();
        }
        
        return {
          ...updatedLead,
          webhook_automatico: isWebhookMatch,
          webhook_data_compra: webhookDate,
        };
      });

      // 5) Filtro por "vendas de hoje" (por data de compra) quando solicitado
      const option = dateFilter?.option?.toLowerCase();
      const getPurchaseDateIso = (l: any) => l?.data_compra || l?.webhook_data_compra || null;

      if (option === 'purchase' || option === 'data_compra' || option === 'paid') {
        // Determinar range: se não vier range, assumir "hoje"
        const now = new Date();
        const start = dateFilter?.startDate ? new Date(`${dateFilter.startDate}T00:00:00`) : new Date(now);
        const end = dateFilter?.endDate ? new Date(`${dateFilter.endDate}T23:59:59`) : new Date(now);
        if (!dateFilter?.startDate && !dateFilter?.endDate) {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        }

        console.log('🗂️ Aplicando filtro por data de compra:', {
          start: start.toISOString(),
          end: end.toISOString(),
          originalCount: processedLeads.length,
        });

        // Apenas leads com compra efetiva no intervalo
        const finalLeads = (processedLeads as LeadParceria[])
          .filter((l) => {
            const iso = getPurchaseDateIso(l);
            if (!iso) return false;
            const dt = new Date(iso);
            return dt >= start && dt <= end && (l.cliente_pago === true || l.status_negociacao === 'comprou');
          })
          .sort((a, b) => {
            const da = new Date(getPurchaseDateIso(a) || 0).getTime();
            const db = new Date(getPurchaseDateIso(b) || 0).getTime();
            return db - da;
          });

        console.log('✅ Filtro por compra aplicado. Exibindo:', finalLeads.length);
        setLeads(finalLeads);
        setTotalLeads(finalLeads.length);
      } else {
        // Comportamento padrão: sem filtro especial por compra
        setLeads(processedLeads as LeadParceria[]);
        setTotalLeads(totalToFetch);
      }
    } catch (err: any) {
      console.error('Erro ao buscar leads de parceria:', err);
      setError(err.message || 'Erro ao carregar os leads');
    } finally {
      setLoading(false);
    }
  };

  // Habilita realtime apenas uma vez
  useEffect(() => {
    enableRealtimeForTable('formularios_parceria').catch(() => {});
    // Garantir realtime para logs do webhook também
    enableRealtimeForTable('kiwify_webhook_logs').catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeads();

    // Realtime: mudanças em formularios_parceria
    const formsChannel = supabase
      .channel('formularios_parceria_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'formularios_parceria',
        },
        () => {
          console.log('📡 Realtime update em formularios_parceria -> refetch');
          fetchLeads();
        }
      )
      .subscribe();

    // Realtime: novos webhooks pagos chegando em kiwify_webhook_logs
    const webhookChannel = supabase
      .channel('kiwify_webhook_logs_inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kiwify_webhook_logs',
        },
        (payload) => {
          const email = (payload?.new as any)?.email_comprador;
          const wd = (payload?.new as any)?.webhook_data;
          console.log('🧲 Novo webhook recebido:', { email, status: wd?.order_status, type: wd?.webhook_event_type });
          // Sempre refaz a busca — o trigger no banco já atualiza o lead
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(formsChannel);
      supabase.removeChannel(webhookChannel);
    };
  }, [stableFilter]);

  // Polling de fallback a cada 30s (cobre qualquer perda de evento)
  useEffect(() => {
    if (refetchTimer.current) {
      clearInterval(refetchTimer.current);
    }
    refetchTimer.current = window.setInterval(() => {
      console.log('⏱️ Polling de leads (fallback a cada 30s)');
      fetchLeads();
    }, 30000);

    return () => {
      if (refetchTimer.current) {
        clearInterval(refetchTimer.current);
        refetchTimer.current = null;
      }
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

  const updateLeadPrecisaMaisInfo = async (leadId: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('formularios_parceria')
        .update({ precisa_mais_info: value })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, precisa_mais_info: value } : lead
      ));
    } catch (err: any) {
      console.error('Erro ao atualizar precisa_mais_info:', err);
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

  const reprocessWebhooks = async (dateRange?: { startDate: string; endDate: string }) => {
    try {
      const { data, error } = await supabase.functions.invoke('reprocess-kiwify-webhooks', {
        body: { dateRange }
      });
      
      if (error) throw error;
      
      console.log('✅ Reprocessamento concluído:', data);
      await fetchLeads(); // Recarregar dados
      
      return data;
    } catch (err: any) {
      console.error('❌ Erro no reprocessamento:', err);
      throw err;
    }
  };

  const refetch = () => {
    fetchLeads();
  };

  const syncKiwifyApprovedOrders = async (dateRange?: { startDate: string; endDate: string }) => {
    try {
      const { data, error } = await supabase.functions.invoke('kiwify-sync-approved-orders', {
        body: { start_date: dateRange?.startDate, end_date: dateRange?.endDate }
      });
      if (error) throw error;
      console.log('✅ Sincronização Kiwify concluída:', data);
      await fetchLeads();
      return data;
    } catch (err: any) {
      console.error('❌ Erro na sincronização Kiwify:', err);
      throw err;
    }
  };

  return {
    leads,
    totalLeads,
    loading,
    error,
    refetch,
    updateLeadStatus,
    updateLeadNegociacao,
    updateLeadPrecisaMaisInfo,
    reatribuirLead,
    reprocessWebhooks,
    syncKiwifyApprovedOrders,
  };
}
