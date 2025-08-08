import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTodayBrazil, getYesterdayBrazil, formatDateBrazil, getBrazilDate } from '@/utils/timezoneUtils';

interface LeadsAnalytics {
  date: string;
  total: number;
  comAudio: number;
  semAudio: number;
  tiposNegocio: { [key: string]: number };
  converted: number;
  conversionRate: number;
  statusBreakdown: { [key: string]: number };
}

interface DateRange {
  startDate: string;
  endDate: string;
}



export function useLeadsAnalytics(dateFilter?: { startDate?: string; endDate?: string; option?: string }) {
  const [todayStats, setTodayStats] = useState<LeadsAnalytics | null>(null);
  const [yesterdayStats, setYesterdayStats] = useState<LeadsAnalytics | null>(null);
  const [dayBeforeStats, setDayBeforeStats] = useState<LeadsAnalytics | null>(null);
  const [customDateStats, setCustomDateStats] = useState<LeadsAnalytics | null>(null);
  const [filteredStats, setFilteredStats] = useState<LeadsAnalytics | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getLeadsForDate = async (date: string): Promise<LeadsAnalytics> => {
    console.log('🔍 [LeadsAnalytics] Buscando leads para data (BRT):', date);

    const pageSize = 1000;
    let from = 0;
    let all: any[] = [];

    while (true) {
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from('formularios_parceria')
        .select('id,audio_visao_futuro,cliente_pago,status_negociacao,tipo_negocio')
        .gte('created_at', `${date}T00:00:00-03:00`)
        .lt('created_at', `${date}T23:59:59-03:00`)
        .range(from, to);

      if (error) {
        console.error('❌ [LeadsAnalytics] Erro na query:', error);
        throw error;
      }

      all = all.concat(data || []);
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    const total = all.length;
    const comAudio = all.filter((lead: any) => lead.audio_visao_futuro && lead.audio_visao_futuro.trim() !== '').length;
    const semAudio = total - comAudio;

    const converted = all.filter((lead: any) => lead.cliente_pago === true).length;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    const statusBreakdown: { [key: string]: number } = {};
    all.forEach((lead: any) => {
      const status = lead.status_negociacao || 'lead';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    const tiposNegocio: { [key: string]: number } = {};
    all.forEach((lead: any) => {
      if (lead.tipo_negocio) {
        let tipo = lead.tipo_negocio;
        if (tipo === 'physical') tipo = 'físico';
        if (tipo === 'digital') tipo = 'digital';
        if (tipo === 'service') tipo = 'serviço';
        tiposNegocio[tipo] = (tiposNegocio[tipo] || 0) + 1;
      }
    });

    const result = {
      date,
      total,
      comAudio,
      semAudio,
      tiposNegocio,
      converted,
      conversionRate,
      statusBreakdown
    };

    console.log('✅ [LeadsAnalytics] Resultado calculado:', result);
    return result;
  };

  const getLeadsForDateRange = async (dateRange: DateRange): Promise<LeadsAnalytics> => {
    const pageSize = 1000;
    let from = 0;
    let all: any[] = [];

    while (true) {
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from('formularios_parceria')
        .select('id,audio_visao_futuro,cliente_pago,status_negociacao,tipo_negocio')
        .gte('created_at', `${dateRange.startDate}T00:00:00`)
        .lte('created_at', `${dateRange.endDate}T23:59:59`)
        .range(from, to);

      if (error) {
        throw error;
      }

      all = all.concat(data || []);
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    const total = all.length;
    const comAudio = all.filter((lead: any) => lead.audio_visao_futuro && lead.audio_visao_futuro.trim() !== '').length;
    const semAudio = total - comAudio;

    const converted = all.filter((lead: any) => lead.cliente_pago === true).length;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    const statusBreakdown: { [key: string]: number } = {};
    all.forEach((lead: any) => {
      const status = lead.status_negociacao || 'lead';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    const tiposNegocio: { [key: string]: number } = {};
    all.forEach((lead: any) => {
      if (lead.tipo_negocio) {
        let tipo = lead.tipo_negocio;
        if (tipo === 'physical') tipo = 'físico';
        if (tipo === 'digital') tipo = 'digital';
        if (tipo === 'service') tipo = 'serviço';
        tiposNegocio[tipo] = (tiposNegocio[tipo] || 0) + 1;
      }
    });

    return {
      date: `${dateRange.startDate} - ${dateRange.endDate}`,
      total,
      comAudio,
      semAudio,
      tiposNegocio,
      converted,
      conversionRate,
      statusBreakdown
    };
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = getTodayBrazil();
      const yesterday = getYesterdayBrazil();
      
      // Calcular anteontem
      const dayBefore = formatDateBrazil(new Date(new Date(yesterday).getTime() - 24 * 60 * 60 * 1000));

      // Buscar dados para os três períodos em paralelo
      const [todayData, yesterdayData, dayBeforeData] = await Promise.all([
        getLeadsForDate(today),
        getLeadsForDate(yesterday),
        getLeadsForDate(dayBefore)
      ]);

      setTodayStats(todayData);
      setYesterdayStats(yesterdayData);
      setDayBeforeStats(dayBeforeData);
    } catch (err: any) {
      console.error('Erro ao buscar analytics de leads:', err);
      setError(err.message || 'Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomDateAnalytics = async (dateRange: DateRange) => {
    try {
      const customData = await getLeadsForDateRange(dateRange);
      setCustomDateStats(customData);
      setFilteredStats(customData);
    } catch (err: any) {
      console.error('Erro ao buscar analytics personalizados:', err);
      setError(err.message || 'Erro ao carregar analytics personalizados');
    }
  };


  useEffect(() => {
    if (dateFilter?.option && dateFilter.option !== 'hoje' && dateFilter.startDate && dateFilter.endDate) {
      fetchCustomDateAnalytics({ startDate: dateFilter.startDate, endDate: dateFilter.endDate });
    } else {
      // Limpar filtro customizado para não "travar" no último período aplicado
      setFilteredStats(null);
      fetchAnalytics();
    }
  }, [dateFilter?.option, dateFilter?.startDate, dateFilter?.endDate]);

  useEffect(() => {
    fetchAnalytics();

    // Configurar escuta de eventos em tempo real
    const channel = supabase
      .channel('leads_analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'formularios_parceria',
        },
        () => {
          if (dateFilter && dateFilter.option && dateFilter.option !== 'hoje' && dateFilter.startDate && dateFilter.endDate) {
            fetchCustomDateAnalytics({ startDate: dateFilter.startDate, endDate: dateFilter.endDate });
          } else {
            fetchAnalytics();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateFilter]);

  const getTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getTrendPercentage = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  };

  return {
    todayStats,
    yesterdayStats,
    dayBeforeStats,
    customDateStats,
    filteredStats,
    
    loading,
    error,
    refetch: fetchAnalytics,
    fetchCustomDateAnalytics,
    
    getTrend,
    getTrendPercentage
  };
}