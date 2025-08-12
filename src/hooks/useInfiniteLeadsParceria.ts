import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useCallback } from 'react';

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
  data_compra?: string | null;
}

interface UseInfiniteLeadsOptions {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  pageSize?: number;
}

const PAGE_SIZE = 50;

export function useInfiniteLeadsParceria(options: UseInfiniteLeadsOptions = {}) {
  const { startDate, endDate, searchTerm, pageSize = PAGE_SIZE } = options;
  const queryClient = useQueryClient();

  const queryKey = ['leads-parceria-infinite', { startDate, endDate, searchTerm, pageSize }];

  // Fetch leads with pagination
  const fetchLeads = async ({ pageParam = 0 }) => {
    console.log('🔄 [useInfiniteLeadsParceria] Fetching page:', pageParam);
    
    const columns = `
      id, created_at, tipo_negocio, email_usuario, planejamento_estrategico, 
      respostas, completo, updated_at, audio_visao_futuro, produto_descricao, 
      valor_medio_produto, ja_teve_vendas, visao_futuro_texto, cliente_pago, 
      contatado_whatsapp, status_negociacao, vendedor_responsavel, distribuido_em, 
      precisa_mais_info, data_compra
    `;

    let query = supabase
      .from('formularios_parceria')
      .select(columns, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
    }

    // Apply search filter - search in email_usuario primarily for performance
    if (searchTerm && searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase().trim();
      // Use simple email search for better performance
      query = query.ilike('email_usuario', `%${term}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [useInfiniteLeadsParceria] Error:', error);
      throw error;
    }

    console.log(`✅ [useInfiniteLeadsParceria] Loaded ${data?.length || 0} leads for page ${pageParam}`);

    return {
      data: data || [],
      nextCursor: data && data.length === pageSize ? pageParam + 1 : undefined,
      totalCount: count || 0,
    };
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchLeads,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Flatten all pages into a single array
  const allLeads = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  // Update lead status mutation
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, field, value }: { 
      leadId: string; 
      field: 'cliente_pago' | 'contatado_whatsapp' | 'precisa_mais_info'; 
      value: boolean 
    }) => {
      const { error } = await supabase
        .from('formularios_parceria')
        .update({ [field]: value })
        .eq('id', leadId);

      if (error) throw error;
      return { leadId, field, value };
    },
    onSuccess: ({ leadId, field, value }) => {
      // Update the lead in cache
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((lead: LeadParceria) =>
              lead.id === leadId ? { ...lead, [field]: value } : lead
            ),
          })),
        };
      });
    },
  });

  // Update lead negotiation status mutation
  const updateLeadNegociacaoMutation = useMutation({
    mutationFn: async ({ leadId, status }: { 
      leadId: string; 
      status: 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago' 
    }) => {
      const updateData: any = { status_negociacao: status };
      
      if (status === 'comprou') {
        updateData.cliente_pago = true;
        updateData.data_compra = new Date().toISOString();
      }

      const { error } = await supabase
        .from('formularios_parceria')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;
      return { leadId, status, updateData };
    },
    onSuccess: ({ leadId, updateData }) => {
      // Update the lead in cache
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((lead: LeadParceria) =>
              lead.id === leadId ? { ...lead, ...updateData } : lead
            ),
          })),
        };
      });
    },
  });

  // Realtime disabled to avoid list flicker during browsing
  // If needed later, we can append new items to cache without invalidating the whole list.
  // useEffect(() => {}, []);

  const updateLeadStatus = useCallback((
    leadId: string, 
    field: 'cliente_pago' | 'contatado_whatsapp' | 'precisa_mais_info', 
    value: boolean
  ) => {
    updateLeadStatusMutation.mutate({ leadId, field, value });
  }, [updateLeadStatusMutation]);

  const updateLeadNegociacao = useCallback((
    leadId: string, 
    status: 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago'
  ) => {
    updateLeadNegociacaoMutation.mutate({ leadId, status });
  }, [updateLeadNegociacaoMutation]);

  const updateLeadPrecisaMaisInfo = useCallback((leadId: string, value: boolean) => {
    updateLeadStatus(leadId, 'precisa_mais_info', value);
  }, [updateLeadStatus]);

  return {
    leads: allLeads,
    totalLeads: totalCount,
    loading: isLoading,
    backgroundUpdating: isFetching && !isFetchingNextPage && !isLoading,
    loadingMore: isFetchingNextPage,
    error: error?.message || null,
    hasMore: hasNextPage,
    fetchMore: fetchNextPage,
    refetch,
    updateLeadStatus,
    updateLeadNegociacao,
    updateLeadPrecisaMaisInfo,
  };
}