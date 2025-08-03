import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTodayBrazil, getYesterdayBrazil, formatDateBrazil, getBrazilDate } from '@/utils/timezoneUtils';

interface LeadsAnalytics {
  date: string;
  total: number;
  comAudio: number;
  semAudio: number;
  tiposNegocio: { [key: string]: number };
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export function useLeadsAnalytics() {
  const [todayStats, setTodayStats] = useState<LeadsAnalytics | null>(null);
  const [yesterdayStats, setYesterdayStats] = useState<LeadsAnalytics | null>(null);
  const [dayBeforeStats, setDayBeforeStats] = useState<LeadsAnalytics | null>(null);
  const [customDateStats, setCustomDateStats] = useState<LeadsAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getLeadsForDate = async (date: string): Promise<LeadsAnalytics> => {
    console.log('🔍 [LeadsAnalytics] Buscando leads para data:', date);
    
    const { data, error } = await supabase
      .from('formularios_parceria')
      .select('*')
      .gte('created_at', `${date} 00:00:00+00`)
      .lt('created_at', `${date} 23:59:59+00`);

    if (error) {
      console.error('❌ [LeadsAnalytics] Erro na query:', error);
      throw error;
    }

    console.log('📊 [LeadsAnalytics] Dados retornados:', { date, count: data?.length || 0, leads: data });

    const total = data?.length || 0;
    const comAudio = data?.filter((lead: any) => lead.audio_visao_futuro && lead.audio_visao_futuro.trim() !== '').length || 0;
    const semAudio = total - comAudio;
    
    // Contar tipos de negócio com tradução
    const tiposNegocio: { [key: string]: number } = {};
    data?.forEach((lead: any) => {
      if (lead.tipo_negocio) {
        let tipo = lead.tipo_negocio;
        // Traduzir tipos de negócio
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
      tiposNegocio
    };

    console.log('✅ [LeadsAnalytics] Resultado calculado:', result);
    return result;
  };

  const getLeadsForDateRange = async (dateRange: DateRange): Promise<LeadsAnalytics> => {
    const { data, error } = await supabase
      .from('formularios_parceria')
      .select('*')
      .gte('created_at', `${dateRange.startDate}T00:00:00`)
      .lte('created_at', `${dateRange.endDate}T23:59:59`);

    if (error) {
      throw error;
    }

    const total = data?.length || 0;
    const comAudio = data?.filter((lead: any) => lead.audio_visao_futuro && lead.audio_visao_futuro.trim() !== '').length || 0;
    const semAudio = total - comAudio;
    
    // Contar tipos de negócio com tradução
    const tiposNegocio: { [key: string]: number } = {};
    data?.forEach((lead: any) => {
      if (lead.tipo_negocio) {
        let tipo = lead.tipo_negocio;
        // Traduzir tipos de negócio
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
      tiposNegocio
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
    } catch (err: any) {
      console.error('Erro ao buscar analytics personalizados:', err);
      setError(err.message || 'Erro ao carregar analytics personalizados');
    }
  };

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
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    loading,
    error,
    refetch: fetchAnalytics,
    fetchCustomDateAnalytics,
    getTrend,
    getTrendPercentage
  };
}