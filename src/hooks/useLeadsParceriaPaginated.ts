import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enableRealtimeForTable } from '@/utils/realtimeUtils';
import { useDebounce } from './useDebounce';

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

interface PaginationConfig {
  page: number;
  limit: number;
  hasMore: boolean;
}

interface UseLeadsParceiriaPaginatedProps {
  dateFilter?: { startDate?: string; endDate?: string; option?: string };
  initialLimit?: number;
}

export function useLeadsParceriaPaginated({ 
  dateFilter, 
  initialLimit = 50 
}: UseLeadsParceiriaPaginatedProps = {}) {
  const [leads, setLeads] = useState<LeadParceria[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    limit: initialLimit,
    hasMore: true
  });
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cache para otimizar re-renders
  const cacheRef = useRef<Map<string, LeadParceria[]>>(new Map());
  const lastFetchTime = useRef<number>(0);
  const pollingInterval = useRef<number | null>(null);

  // Debounce do filtro de data para evitar muitas consultas
  const debouncedDateFilter = useDebounce(dateFilter, 300);

  // Normalização de email para webhook matching
  const normalizeEmail = useCallback((e: any) => {
    if (typeof e !== 'string') return '';
    return e.trim().toLowerCase()
      .replace('hotmil.com', 'hotmail.com')
      .replace('gmai.com', 'gmail.com')
      .replace('outlok.com', 'outlook.com')
      .replace(/\s+/g, '');
  }, []);

  // Cache key para identificar consultas únicas
  const getCacheKey = useCallback((page: number, limit: number, filter?: typeof dateFilter) => {
    return `${page}-${limit}-${filter?.startDate || ''}-${filter?.endDate || ''}-${filter?.option || ''}`;
  }, []);

  const fetchLeadsPage = useCallback(async (page: number, reset: boolean = false) => {
    const cacheKey = getCacheKey(page, pagination.limit, debouncedDateFilter);
    
    // Verificar cache se não é um reset e a busca foi recente (< 2 min)
    if (!reset && cacheRef.current.has(cacheKey) && 
        Date.now() - lastFetchTime.current < 120000) {
      const cachedLeads = cacheRef.current.get(cacheKey) || [];
      if (page === 1) {
        setLeads(cachedLeads);
      } else {
        setLeads(prev => [...prev, ...cachedLeads]);
      }
      return;
    }

    if (page === 1) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const columns = 'id, created_at, data_compra, tipo_negocio, email_usuario, planejamento_estrategico, respostas, completo, updated_at, audio_visao_futuro, produto_descricao, valor_medio_produto, ja_teve_vendas, visao_futuro_texto, cliente_pago, contatado_whatsapp, status_negociacao, vendedor_responsavel, distribuido_em, precisa_mais_info';

      // Buscar contagem total apenas na primeira página
      if (page === 1) {
        let countQuery = supabase
          .from('formularios_parceria')
          .select('id', { count: 'exact', head: true });

        if (debouncedDateFilter?.startDate && debouncedDateFilter?.endDate) {
          countQuery = countQuery
            .gte('created_at', `${debouncedDateFilter.startDate}T00:00:00`)
            .lte('created_at', `${debouncedDateFilter.endDate}T23:59:59`);
        }

        const { count, error: countError } = await countQuery;
        if (countError) throw countError;
        setTotalLeads(count || 0);
      }

      // Buscar página atual
      const from = (page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;

      let pageQuery = supabase
        .from('formularios_parceria')
        .select(columns)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (debouncedDateFilter?.startDate && debouncedDateFilter?.endDate) {
        pageQuery = pageQuery
          .gte('created_at', `${debouncedDateFilter.startDate}T00:00:00`)
          .lte('created_at', `${debouncedDateFilter.endDate}T23:59:59`);
      }

      const { data: leadsData, error: leadsError } = await pageQuery;
      if (leadsError) throw leadsError;

      const pageLeads = leadsData || [];

      // Buscar webhooks apenas para emails desta página (otimização crítica)
      const emailsWebhookNormalized = new Set<string>();
      const emailToWebhookDate = new Map<string, string>();

      if (pageLeads.length > 0) {
        const pageEmails = pageLeads
          .map(l => l.email_usuario)
          .filter((e): e is string => typeof e === 'string' && e.length > 0);

        if (pageEmails.length > 0) {
          try {
            const { data: webhookData, error: webhookError } = await supabase
              .from('kiwify_webhook_logs')
              .select('email_comprador, webhook_data, created_at, status_processamento')
              .in('email_comprador', pageEmails);

            if (!webhookError && webhookData) {
              const extractDateIso = (...vals: any[]) => {
                for (const v of vals) {
                  if (v && typeof v === 'string' && v.trim().length > 0) {
                    const d = new Date(v);
                    if (!isNaN(d.getTime())) return d.toISOString();
                  }
                }
                return null;
              };

              for (const log of webhookData) {
                const wd = log?.webhook_data as any || {};
                const statusStr = (wd?.order_status || wd?.status || '').toString().toLowerCase();
                const isPaidEvent = statusStr === 'paid' || 
                  !!(wd?.approved_at || wd?.paid_at || wd?.order?.approved_at || 
                     wd?.order?.paid_at || wd?.data?.approved_at || wd?.data?.paid_at);
                
                if (!isPaidEvent) continue;
                
                const dt = extractDateIso(
                  wd?.approved_at, wd?.paid_at, wd?.order?.approved_at,
                  wd?.order?.paid_at, wd?.data?.approved_at, wd?.data?.paid_at
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
              
              // Clear and rebuild the set
              emailsWebhookNormalized.clear();
              Array.from(emailToWebhookDate.keys()).forEach(email => {
                emailsWebhookNormalized.add(email);
              });
            }
          } catch (webhookError) {
            console.warn('Erro ao buscar webhooks para página:', webhookError);
          }
        }
      }

      // Processar leads com dados de webhook
      const processedLeads: LeadParceria[] = pageLeads.map((lead) => {
        const emailNorm = normalizeEmail(lead.email_usuario);
        const webhookDate = emailNorm ? (emailToWebhookDate.get(emailNorm) || null) : null;
        const isWebhookMatch = emailNorm ? emailsWebhookNormalized.has(emailNorm) : false;
        
        return {
          ...lead,
          status_negociacao: (lead.status_negociacao || 'lead') as 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago',
          webhook_automatico: isWebhookMatch,
          webhook_data_compra: webhookDate,
        } as LeadParceria;
      });

      // Aplicar filtro por compra se necessário
      let finalLeads = processedLeads;
      if (debouncedDateFilter?.option === 'purchase' || debouncedDateFilter?.option === 'data_compra') {
        const start = debouncedDateFilter?.startDate ? 
          new Date(`${debouncedDateFilter.startDate}T00:00:00`) : new Date();
        const end = debouncedDateFilter?.endDate ? 
          new Date(`${debouncedDateFilter.endDate}T23:59:59`) : new Date();
        
        if (!debouncedDateFilter?.startDate && !debouncedDateFilter?.endDate) {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        }

        finalLeads = processedLeads.filter((l) => {
          const iso = l.data_compra || l.webhook_data_compra;
          if (!iso) return false;
          const dt = new Date(iso);
          return dt >= start && dt <= end && (l.cliente_pago === true || l.status_negociacao === 'comprou');
        }) as LeadParceria[];
      }

      // Cache da página
      cacheRef.current.set(cacheKey, finalLeads);
      lastFetchTime.current = Date.now();

      // Atualizar leads
      if (page === 1 || reset) {
        setLeads(finalLeads);
      } else {
        setLeads(prev => [...prev, ...finalLeads]);
      }

      // Atualizar paginação
      setPagination(prev => ({
        ...prev,
        page: page,
        hasMore: finalLeads.length === pagination.limit
      }));

    } catch (err: any) {
      console.error('Erro ao buscar leads paginados:', err);
      setError(err.message || 'Erro ao carregar os leads');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [pagination.limit, debouncedDateFilter, normalizeEmail, getCacheKey]);

  // Carregar próxima página
  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchLeadsPage(pagination.page + 1);
    }
  }, [loading, pagination.hasMore, pagination.page, fetchLeadsPage]);

  // Reset para primeira página
  const resetPagination = useCallback(() => {
    cacheRef.current.clear();
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
    fetchLeadsPage(1, true);
  }, [fetchLeadsPage]);

  // Refetch atual
  const refetch = useCallback(() => {
    cacheRef.current.clear();
    fetchLeadsPage(pagination.page, true);
  }, [pagination.page, fetchLeadsPage]);

  // Inicialização e filtros
  useEffect(() => {
    fetchLeadsPage(1, true);
  }, [debouncedDateFilter]);

  // Realtime com debounce
  useEffect(() => {
    enableRealtimeForTable('formularios_parceria').catch(() => {});
    enableRealtimeForTable('kiwify_webhook_logs').catch(() => {});

    let realtimeDebounce: number;

    const formsChannel = supabase
      .channel('formularios_parceria_changes_paginated')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'formularios_parceria',
      }, () => {
        clearTimeout(realtimeDebounce);
        realtimeDebounce = window.setTimeout(() => {
          console.log('📡 Realtime update -> refetch');
          refetch();
        }, 1000); // Debounce de 1s
      })
      .subscribe();

    const webhookChannel = supabase
      .channel('kiwify_webhook_logs_inserts_paginated')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'kiwify_webhook_logs',
      }, () => {
        clearTimeout(realtimeDebounce);
        realtimeDebounce = window.setTimeout(() => {
          console.log('🧲 Novo webhook -> refetch');
          refetch();
        }, 2000); // Debounce maior para webhooks
      })
      .subscribe();

    return () => {
      clearTimeout(realtimeDebounce);
      supabase.removeChannel(formsChannel);
      supabase.removeChannel(webhookChannel);
    };
  }, [refetch]);

  // Polling reduzido (3 minutos)
  useEffect(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    pollingInterval.current = window.setInterval(() => {
      console.log('⏱️ Polling de leads (3min)');
      refetch();
    }, 180000); // 3 minutos

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [refetch]);

  // Update functions
  const updateLeadStatus = useCallback(async (leadId: string, field: 'cliente_pago' | 'contatado_whatsapp', value: boolean) => {
    try {
      const { error } = await supabase
        .from('formularios_parceria')
        .update({ [field]: value })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, [field]: value } : lead
      ));
    } catch (err: any) {
      console.error(`Erro ao atualizar ${field}:`, err);
      setError(err.message);
    }
  }, []);

  const updateLeadNegociacao = useCallback(async (leadId: string, status: 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago') => {
    try {
      const updates: any = { status_negociacao: status };
      
      if (status === 'comprou') {
        updates.cliente_pago = true;
        updates.data_compra = new Date().toISOString();
      }
      
      if (status === 'lead') {
        updates.cliente_pago = false;
      }

      const { error } = await supabase
        .from('formularios_parceria')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));
    } catch (err: any) {
      console.error('Erro ao atualizar status de negociação:', err);
      setError(err.message);
    }
  }, []);

  const updateLeadPrecisaMaisInfo = useCallback(async (leadId: string, value: boolean) => {
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
  }, []);

  const reatribuirLead = useCallback(async (leadId: string, novoVendedor: string | null) => {
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
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));
    } catch (err: any) {
      console.error('Erro ao reatribuir lead:', err);
      setError(err.message);
    }
  }, []);

  const reprocessWebhooks = useCallback(async (dateRange?: { startDate: string; endDate: string }) => {
    try {
      const { data, error } = await supabase.functions.invoke('reprocess-kiwify-webhooks', {
        body: dateRange
      });
      if (error) throw error;
      
      // Refetch após reprocessamento
      setTimeout(() => refetch(), 1000);
      return data;
    } catch (err: any) {
      console.error('Erro ao reprocessar webhooks:', err);
      throw err;
    }
  }, [refetch]);

  const syncKiwifyApprovedOrders = useCallback(async (dateRange?: { startDate: string; endDate: string }) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-kiwify-approved-orders', {
        body: dateRange
      });
      if (error) throw error;
      
      // Refetch após sincronização
      setTimeout(() => refetch(), 1000);
      return data;
    } catch (err: any) {
      console.error('Erro ao sincronizar pedidos Kiwify:', err);
      throw err;
    }
  }, [refetch]);

  return {
    leads,
    totalLeads,
    loading: initialLoading || loading,
    error,
    pagination,
    loadMore,
    resetPagination,
    refetch,
    updateLeadStatus,
    updateLeadNegociacao,
    updateLeadPrecisaMaisInfo,
    reatribuirLead,
    reprocessWebhooks,
    syncKiwifyApprovedOrders
  };
}