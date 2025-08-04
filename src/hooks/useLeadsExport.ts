import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { extractLeadData, translateStatus } from '@/utils/leadDataExtractor';
import Papa from 'papaparse';

interface ExportableLead {
  id: string;
  created_at: string;
  email_usuario: string;
  tipo_negocio: string;
  status_negociacao: string;
  produto_descricao: string | null;
  valor_medio_produto: number | null;
  respostas: any;
}

interface ExportData {
  'Data do Lead': string;
  'Nome': string;
  'Email': string;
  'WhatsApp': string;
  'Tipo de Negócio': string;
  'Status': string;
  'Descrição do Produto': string;
  'Valor Médio': string;
  'Já Teve Vendas': string;
  'Observações': string;
}

export function useLeadsExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportableCount, setExportableCount] = useState(0);
  const { user } = useAuth();

  const getExportableLeadsCount = useCallback(async (): Promise<number> => {
    if (!user?.email) return 0;

    try {
      const { count, error } = await supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact', head: true })
        .eq('vendedor_responsavel', user.email)
        .neq('status_negociacao', 'aceitou')
        .is('exportado_em', null);

      if (error) {
        console.error('Erro ao contar leads exportáveis:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Erro ao contar leads exportáveis:', error);
      return 0;
    }
  }, [user?.email]);

  const exportLeads = async (): Promise<void> => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // Buscar leads exportáveis
      const { data: leads, error } = await supabase
        .from('formularios_parceria')
        .select('*')
        .eq('vendedor_responsavel', user.email)
        .neq('status_negociacao', 'aceitou')
        .is('exportado_em', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar leads: ${error.message}`);
      }

      if (!leads || leads.length === 0) {
        toast({
          title: "Informação",
          description: "Nenhum lead novo disponível para exportar",
          variant: "default"
        });
        return;
      }

      // Formatar dados para exportação usando extração robusta
      const exportData: ExportData[] = leads.map((lead: ExportableLead) => {
        const leadData = extractLeadData(lead);
        const respostas = lead.respostas || {};
        
        // Extrair observações adicionais
        const observacoes = [
          respostas.observacoes,
          respostas.comentarios,
          respostas.detalhes,
          respostas.dadosPersonais?.observacoes
        ].filter(Boolean).join('; ') || 'Nenhuma observação';
        
        return {
          'Data do Lead': new Date(lead.created_at).toLocaleDateString('pt-BR'),
          'Nome': leadData.nome,
          'Email': leadData.email,
          'WhatsApp': leadData.whatsapp,
          'Tipo de Negócio': leadData.tipoNegocio,
          'Status': translateStatus(lead.status_negociacao),
          'Descrição do Produto': leadData.produtoDescricao,
          'Valor Médio': leadData.valorMedio,
          'Já Teve Vendas': leadData.jaTevVendas,
          'Observações': observacoes
        };
      });

      // Gerar CSV
      const csv = Papa.unparse(exportData, {
        quotes: true,
        delimiter: ',',
        header: true
      });

      // Criar e baixar arquivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const vendedorName = user.email.split('@')[0].replace('vendedor', '');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `leads_${vendedorName}_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Marcar leads como exportados
      const leadIds = leads.map(lead => lead.id);
      const { error: updateError } = await supabase
        .from('formularios_parceria')
        .update({
          exportado_em: new Date().toISOString(),
          exportado_por: user.email
        })
        .in('id', leadIds);

      if (updateError) {
        console.error('Erro ao marcar leads como exportados:', updateError);
        toast({
          title: "Aviso",
          description: `${leads.length} leads exportados, mas houve erro ao marcar como exportados`,
          variant: "default"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `${leads.length} leads exportados com sucesso!`,
        variant: "default"
      });

      // Atualizar contador
      setExportableCount(0);

    } catch (error: any) {
      console.error('Erro ao exportar leads:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar leads. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const refreshExportableCount = useCallback(async () => {
    const count = await getExportableLeadsCount();
    setExportableCount(count);
  }, [getExportableLeadsCount]);

  return {
    isExporting,
    exportableCount,
    exportLeads,
    refreshExportableCount
  };
}

// As funções auxiliares agora estão no leadDataExtractor.ts