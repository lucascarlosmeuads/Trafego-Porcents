import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, User, Eye, CheckCircle, Wand2, Download, AlertCircle, MessageSquareText } from 'lucide-react';

import { LeadDetailsModal } from './LeadDetailsModal';
import { useLeadsParceria } from '@/hooks/useLeadsParceria';

import { useGlobalDateFilter } from '@/hooks/useGlobalDateFilter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlanejamentoPreviewModal } from './PlanejamentoPreviewModal';
import { PersonalizedMessageModal } from './PersonalizedMessageModal';
import { downloadPlanPdf } from '@/utils/planDownload';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecoveryMessageSettings } from './RecoveryMessageSettings';
import { useRecoveryTemplate, DEFAULT_RECOVERY_TEMPLATE } from '@/hooks/useRecoveryTemplate';
import { applyTemplate, getFirstName } from '@/utils/templateUtils';

export function LeadsParcerriaPanel() {
  // Filtro de data local: hoje, ontem, personalizado
  const [dateOption, setDateOption] = useState<'todos' | 'hoje' | 'ontem' | 'personalizado'>('todos');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const makeRange = (
    option: 'todos' | 'hoje' | 'ontem' | 'personalizado',
    start: string,
    end: string
  ) => {
    const pad = (d: Date) => d.toISOString().slice(0, 10);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (option === 'todos') return undefined;

    if (option === 'hoje') {
      const s = pad(today);
      return { startDate: s, endDate: s, option: 'hoje' };
    }
    if (option === 'ontem') {
      const s = pad(yesterday);
      return { startDate: s, endDate: s, option: 'ontem' };
    }
    if (start && end) return { startDate: start, endDate: end, option: 'personalizado' };
    return undefined;
  };

  const filterToUse = useMemo(() => makeRange(dateOption, customStart, customEnd), [dateOption, customStart, customEnd]);
  
  const computedRange = useMemo(() => {
    if (dateOption === 'todos') return null as null | { start: number; end: number };
    const today = new Date();
    const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

    if (dateOption === 'hoje') {
      return { start: startOfDay(today).getTime(), end: endOfDay(today).getTime() };
    }
    if (dateOption === 'ontem') {
      const y = new Date(); y.setDate(today.getDate() - 1);
      return { start: startOfDay(y).getTime(), end: endOfDay(y).getTime() };
    }
    if (dateOption === 'personalizado' && customStart && customEnd) {
      const s = startOfDay(new Date(customStart));
      const e = endOfDay(new Date(customEnd));
      return { start: s.getTime(), end: e.getTime() };
    }
    return null;
  }, [dateOption, customStart, customEnd]);
  
  const { leads, loading, updateLeadNegociacao, updateLeadPrecisaMaisInfo, refetch } = useLeadsParceria(undefined);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'leads' | 'compraram'>('compraram');
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planContent, setPlanContent] = useState<string | null>(null);
  const [planClientName, setPlanClientName] = useState<string>('Cliente');
  const [planEmail, setPlanEmail] = useState<string | undefined>(undefined);
  const [bulkSize, setBulkSize] = useState<'todos' | '10' | '20'>('10');
  const [bulkLoading, setBulkLoading] = useState(false);
  const { toast } = useToast();
  const [showNeedsInfoOnly, setShowNeedsInfoOnly] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const [personalizedClient, setPersonalizedClient] = useState<{ name?: string; phone?: string | null }>({});
  // Conjuntos e contadores por aba
  const purchasedStatuses = useMemo(() => new Set(['comprou','planejando','planejamento_entregue','upsell_pago']), []);
  const leadsCount = useMemo(() => {
    const base = leads.filter(l => !purchasedStatuses.has(l.status_negociacao));
    if (!computedRange) return base.length;
    const { start, end } = computedRange;
    return base.filter((l: any) => {
      const t = new Date(l.created_at).getTime();
      return t >= start && t <= end;
    }).length;
  }, [leads, purchasedStatuses, computedRange]);

  const webhookComprasCount = useMemo(() => {
    const base = leads.filter(l => l.webhook_automatico);
    if (!computedRange) return base.length;
    const { start, end } = computedRange;
    return base.filter((l: any) => {
      const dtStr = (l.webhook_data_compra || l.data_compra) as string | null;
      const dt = dtStr ? new Date(dtStr).getTime() : NaN;
      return !isNaN(dt) && dt >= start && dt <= end;
    }).length;
  }, [leads, computedRange]);

  const systemCompraramCount = useMemo(() => {
    const base = leads.filter(l => purchasedStatuses.has(l.status_negociacao) && l.cliente_pago);
    if (!computedRange) return base.length;
    const { start, end } = computedRange;
    return base.filter((l: any) => {
      const dtStr = (l.data_compra || l.webhook_data_compra) as string | null;
      const dt = dtStr ? new Date(dtStr).getTime() : NaN;
      return !isNaN(dt) && dt >= start && dt <= end;
    }).length;
  }, [leads, purchasedStatuses, computedRange]);

  // Elegibilidade para geração (sem plano e com informação suficiente)
  const compraramLeads = useMemo(
    () => leads.filter(l => purchasedStatuses.has(l.status_negociacao)),
    [leads, purchasedStatuses]
  );
  const isEligibleForPlan = (lead: any) => {
    const hasPlan = (lead.planejamento_estrategico ?? '').toString().trim().length > 0;
    const visaoLen = (lead.visao_futuro_texto ?? '').toString().trim().length;
    const temAudio = !!lead.audio_visao_futuro;
    const infoSuficiente = temAudio || visaoLen >= 40;
    return !hasPlan && infoSuficiente;
  };
  const elegiveisCount = useMemo(
    () => compraramLeads.filter(isEligibleForPlan).length,
    [compraramLeads]
  );
  const handleWhatsAppClick = (whatsapp: string) => {
    // Remove todos os caracteres não numéricos
    const cleanNumber = whatsapp.replace(/\D/g, '');
    
    // Adiciona código do país se necessário
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  const getLeadData = (lead: any) => {
    const respostas = lead.respostas || {};
    
    return {
      nome: respostas.dadosPersonais?.nome || respostas.nome || 'Não informado',
      email: respostas.dadosPersonais?.email || respostas.email || 'Não informado',
      whatsapp: respostas.dadosPersonais?.whatsapp || respostas.whatsapp || respostas.telefone || 'Não informado'
    };
  };

  const translateTipoNegocio = (tipo: string) => {
    if (tipo === 'physical') return 'físico';
    if (tipo === 'digital') return 'digital';
    if (tipo === 'service') return 'serviço';
    return tipo;
  };

  const getRowClassName = (lead: any) => {
    if (lead.status_negociacao === 'comprou' && lead.cliente_pago) {
      return 'bg-green-100 hover:bg-green-200 border-l-4 border-l-green-500 text-green-900 ring-2 ring-green-300';
    }
    if (lead.status_negociacao === 'comprou') {
      return 'bg-green-100 hover:bg-green-200 border-l-4 border-l-green-500 text-green-900';
    }
    if (lead.status_negociacao === 'planejando') {
      return 'bg-blue-100 hover:bg-blue-200 border-l-4 border-l-blue-500 text-blue-900';
    }
    if (lead.status_negociacao === 'planejamento_entregue') {
      return 'bg-purple-100 hover:bg-purple-200 border-l-4 border-l-purple-500 text-purple-900';
    }
    if (lead.status_negociacao === 'upsell_pago') {
      return 'bg-emerald-100 hover:bg-emerald-200 border-l-4 border-l-emerald-500 text-emerald-900';
    }
    if (lead.status_negociacao === 'recusou') {
      return 'bg-red-100 hover:bg-red-200 border-l-4 border-l-red-500 text-red-900';
    }
    return '';
  };

  const getStatusBadge = (lead: any) => {
    if (lead.precisa_mais_info) {
      return (
        <Badge className="bg-orange-500 text-white">Precisa mais info</Badge>
      );
    }
    if (lead.status_negociacao === 'comprou' && lead.cliente_pago && lead.webhook_automatico) {
      return (
        <Badge className="bg-green-600 text-white">
          ✅ Comprou (Automático)
        </Badge>
      );
    }
    if (lead.webhook_data_compra) {
      return (
        <Badge className="bg-emerald-600 text-white">
          Aprovado (Webhook)
        </Badge>
      );
    }
    return null;
  };

  const baseLeads = useMemo(() => {
    return leads.filter(l => (activeTab === 'compraram'
      ? ((purchasedStatuses.has(l.status_negociacao) && l.cliente_pago) || !!l.webhook_data_compra)
      : !purchasedStatuses.has(l.status_negociacao)));
  }, [leads, activeTab, purchasedStatuses]);

  const filteredLeads = useMemo(() => {
    let list: any[] = baseLeads as any[];

    // Aplicar filtro de data: created_at para Leads, data_compra para Compraram
    if (computedRange) {
      const { start, end } = computedRange;
      if (activeTab === 'compraram') {
        list = list.filter((lead: any) => {
          const dtStr = (lead.data_compra || lead.webhook_data_compra) as string | null;
          const dt = dtStr ? new Date(dtStr).getTime() : NaN;
          return !isNaN(dt) && dt >= start && dt <= end;
        });
      } else {
        list = list.filter((lead: any) => {
          const t = new Date(lead.created_at).getTime();
          return t >= start && t <= end;
        });
      }
    }

    if (activeTab !== 'compraram' && statusFilter !== 'todos') {
      list = list.filter(lead => (lead.status_negociacao || 'lead') === statusFilter);
    }

    if (showNeedsInfoOnly) {
      list = list.filter(lead => !!lead.precisa_mais_info);
    }

    if (activeTab === 'compraram') {
      list = [...list].sort((a, b) => {
        const aDtStr = (a.data_compra || a.webhook_data_compra || a.created_at) as string;
        const bDtStr = (b.data_compra || b.webhook_data_compra || b.created_at) as string;
        const aDt = aDtStr ? new Date(aDtStr).getTime() : 0;
        const bDt = bDtStr ? new Date(bDtStr).getTime() : 0;
        return bDt - aDt;
      });
    }

    return list;
  }, [baseLeads, statusFilter, activeTab, showNeedsInfoOnly, computedRange]);

  const handleBulkGenerate = async () => {
    try {
      if (activeTab !== 'compraram') {
        toast({ title: 'Disponível apenas em "Compraram"', description: 'Geração em lote só para clientes que compraram.' });
        return;
      }
      if (elegiveisCount === 0) {
        toast({ title: 'Nenhum lead elegível', description: 'Todos já têm plano ou faltam informações suficientes.' });
        return;
      }
      setBulkLoading(true);
      const size = bulkSize === 'todos' ? undefined : Number(bulkSize);
      toast({ title: 'Iniciando geração em lote', description: `Tamanho do lote: ${bulkSize} • Elegíveis: ${elegiveisCount}` });
      const { data, error } = await supabase.functions.invoke('bulk-generate-parceria-plans', { body: { size } });
      if (error) throw error;
      const g = data?.gerados || 0;
      const i = data?.marcadosInsuficiente || 0;
      toast({ title: 'Geração em lote concluída', description: `Gerados: ${g} • Insuficientes: ${i}` });
      refetch?.();
    } catch (err: any) {
      console.error('Erro geração em lote:', err);
      toast({ title: 'Erro na geração em lote', description: err.message || 'Falha ao gerar planejamentos', variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleGenerateUntilComplete = async () => {
    try {
      if (activeTab !== 'compraram') {
        toast({ title: 'Disponível apenas em "Compraram"', description: 'Use esta opção apenas para quem comprou.' });
        return;
      }
      if (elegiveisCount === 0) {
        toast({ title: 'Nenhum lead elegível', description: 'Todos já têm plano ou faltam informações suficientes.' });
        return;
      }
      setBulkLoading(true);
      toast({ title: 'Geração contínua iniciada', description: 'Processaremos em lotes até finalizar.' });
      let totalProcessados = 0, totalGerados = 0, totalInsuf = 0, rodadas = 0;
      while (true) {
        const { data, error } = await supabase.functions.invoke('bulk-generate-parceria-plans', { body: { size: 20 } });
        if (error) throw error;
        const gerados = data?.gerados || 0;
        const insuf = data?.marcadosInsuficiente || 0;
        const processados = data?.processados || gerados + insuf;
        totalProcessados += processados; totalGerados += gerados; totalInsuf += insuf; rodadas += 1;
        if ((gerados + insuf) === 0) break;
        await new Promise(r => setTimeout(r, 600));
      }
      toast({ title: 'Geração contínua concluída', description: `Rodadas: ${rodadas} • Gerados: ${totalGerados} • Insuficientes: ${totalInsuf}` });
      refetch?.();
    } catch (err: any) {
      console.error('Erro na geração contínua:', err);
      toast({ title: 'Erro', description: err.message || 'Falha ao processar geração contínua', variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCSV = () => {
    const items = leads.filter(l => l.precisa_mais_info);
    const header = ['Data', 'Nome', 'Email', 'WhatsApp', 'Vendedor', 'Tipo Negócio', 'Status'];
    const rows = items.map(l => {
      const r = l.respostas || {};
      const nome = r.dadosPersonais?.nome || r.nome || 'Não informado';
      const email = r.dadosPersonais?.email || r.email || l.email_usuario || 'Não informado';
      const whatsapp = r.dadosPersonais?.whatsapp || r.whatsapp || r.telefone || 'Não informado';
      const vendedor = l.vendedor_responsavel || 'N/A';
      const tipo = l.tipo_negocio || 'N/A';
      const status = l.status_negociacao || 'lead';
      const data = new Date(l.created_at).toLocaleDateString('pt-BR');
      return [data, nome, email, whatsapp, vendedor, tipo, status];
    });
    const csv = [header, ...rows]
      .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-precisa-mais-info.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGeneratePlan = async (lead: any) => {
    try {
      setGenerating(prev => ({ ...prev, [lead.id]: true }));

      const { data, error } = await supabase.functions.invoke('generate-plan-with-assistant', {
        body: { emailCliente: lead.email_usuario }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha ao gerar planejamento');

      toast({ title: 'Planejamento gerado', description: 'Planejamento estratégico criado com sucesso usando assistente personalizado!' });
      setPlanContent(data.planejamento);
      const leadData = getLeadData(lead);
      setPlanClientName(leadData.nome || 'Cliente');
      setPlanEmail(lead.email_usuario || undefined);
      setPlanModalOpen(true);
      // Atualiza status localmente
      updateLeadNegociacao?.(lead.id, 'planejando');
    } catch (err: any) {
      console.error('Erro ao gerar planejamento:', err);
      toast({ title: 'Erro', description: 'Não foi possível gerar o planejamento.', variant: 'destructive' });
    } finally {
      setGenerating(prev => ({ ...prev, [lead.id]: false }));
    }
  };

  const handleGeneratePersonalizedMessage = async (lead: any) => {
    try {
      toast({ title: 'Gerando mensagem', description: 'Preparando mensagem personalizada...' });
      const { data, error } = await supabase.functions.invoke('generate-personalized-message', {
        body: { leadId: lead.id }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha ao gerar mensagem');

      setPersonalizedMessage(data.message as string);
      setPersonalizedClient({ name: data.client_name as string, phone: data.phone as string | null });
      setMessageModalOpen(true);
    } catch (err: any) {
      console.error('Erro ao gerar mensagem:', err);
      toast({ title: 'Erro', description: err.message || 'Não foi possível gerar a mensagem.', variant: 'destructive' });
    }
  };

  const { template: recoveryTemplate } = useRecoveryTemplate('leads_parceria');

  const handleWhatsAppContact = async (lead: any) => {
    if (!lead?.id) return;

    // Verificar se Evolution API está conectada antes de enviar
    try {
      const connectionCheck = await supabase.functions.invoke('evolution-check-connection');
      
      if (!connectionCheck.data?.success || connectionCheck.data?.status !== 'connected') {
        toast({
          title: 'WhatsApp não conectado',
          description: 'Conecte o WhatsApp na configuração da Evolution API primeiro',
          variant: 'destructive'
        });
        return;
      }
    } catch (err) {
      console.error('Erro ao verificar conexão:', err);
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível verificar status da conexão WhatsApp',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await supabase.functions.invoke('evolution-send-message', {
        body: { leadId: lead.id }
      });

      if (result.error) {
        console.error('Erro ao enviar mensagem:', result.error);
        toast({
          title: 'Erro ao enviar mensagem',
          description: result.error.message || 'Erro desconhecido',
          variant: 'destructive'
        });
        return;
      }

      toast({ title: 'Mensagem enviada!', description: 'Lead marcado como contatado via Evolution API.' });
      // Atualizar dados após envio
      refetch?.();
    } catch (err: any) {
      console.error('Erro ao contatar lead:', err);
      toast({
        title: 'Erro ao enviar mensagem',
        description: err.message || 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  const handleOpenRecoveryModal = (lead: any) => {
    const leadData = getLeadData(lead);
    const vars = {
      nome: (leadData.nome || '').toString(),
      primeiro_nome: getFirstName(leadData.nome || ''),
      tipo_negocio: translateTipoNegocio(lead.tipo_negocio || ''),
    };
    const finalMessage = applyTemplate(recoveryTemplate || DEFAULT_RECOVERY_TEMPLATE, vars);

    setPersonalizedMessage(finalMessage);
    setPersonalizedClient({ name: leadData.nome, phone: leadData.whatsapp });
    setMessageModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando leads...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Lista de Leads
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end w-full md:w-auto">
                {/* Botão para configurar a mensagem de recuperação */}
                <RecoveryMessageSettings />

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'leads' | 'compraram')}>
                  <TabsList>
                    <TabsTrigger value="leads">Leads ({leadsCount})</TabsTrigger>
                    <TabsTrigger value="compraram">Compraram (Sist {systemCompraramCount} | Webhook {webhookComprasCount})</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Período:</span>
                  <Select value={dateOption} onValueChange={(v) => setDateOption(v as any)}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background">
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="hoje">Hoje</SelectItem>
                      <SelectItem value="ontem">Ontem</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  {dateOption === 'personalizado' && (
                    <>
                      <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-36" />
                      <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-36" />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="needsInfoOnly" checked={showNeedsInfoOnly} onCheckedChange={(v) => setShowNeedsInfoOnly(!!v)} />
                    <label htmlFor="needsInfoOnly" className="text-sm text-muted-foreground">Apenas "Precisa mais info"</label>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-1" /> Exportar CSV
                  </Button>
                </div>
                {activeTab === 'compraram' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Elegíveis:</span>
                    <Badge variant="secondary">{elegiveisCount}</Badge>
                    <span className="mx-2 h-4 w-px bg-border" />
                    <span className="text-sm text-muted-foreground">Lote:</span>
                    <Select value={bulkSize} onValueChange={(v) => setBulkSize(v as any)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkGenerate}
                      disabled={bulkLoading || elegiveisCount === 0}
                    >
                      {bulkLoading ? 'Gerando...' : `Gerar 1 lote (${bulkSize})`}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleGenerateUntilComplete}
                      disabled={bulkLoading || elegiveisCount === 0}
                    >
                      {bulkLoading ? 'Aguarde...' : 'Gerar até concluir'}
                    </Button>
                  </div>
                )}
                {activeTab === 'leads' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filtrar por status:</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                       <SelectContent className="z-50 bg-background">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="lead">lead</SelectItem>
                        <SelectItem value="planejando">planj/gerado</SelectItem>
                        <SelectItem value="planejamento_entregue">planj/entregue</SelectItem>
                        <SelectItem value="upsell_pago">upsell pago</SelectItem>
                        <SelectItem value="recusou">não quer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Vendedor Responsável</TableHead>
                    <TableHead>Status Negociação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const leadData = getLeadData(lead);
                    
                    return (
                      <TableRow key={lead.id} className={getRowClassName(lead)}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(lead.created_at), 'HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{leadData.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {translateTipoNegocio(lead.tipo_negocio)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{leadData.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{leadData.whatsapp}</span>
                            {leadData.whatsapp !== 'Não informado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleWhatsAppClick(leadData.whatsapp)}
                                className="h-8 w-8 p-0"
                              >
                                <MessageCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center gap-2">
                            {lead.vendedor_responsavel ? (
                              <span>
                                {lead.vendedor_responsavel === 'vendedoredu@trafegoporcents.com' 
                                  ? 'Edu' 
                                  : lead.vendedor_responsavel === 'vendedoritamar@trafegoporcents.com'
                                  ? 'Itamar'
                                  : 'João'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Não atribuído</span>
                            )}
                            {lead.status_negociacao === 'comprou' && lead.cliente_pago && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Select
                              value={lead.status_negociacao || 'lead'}
                              onValueChange={(value: 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago') => {
                                updateLeadNegociacao?.(lead.id, value);
                                if (['comprou','planejando','planejamento_entregue','upsell_pago'].includes(value)) {
                                  setActiveTab('compraram');
                                } else {
                                  setActiveTab('leads');
                                }
                              }}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50 bg-background">
                                <SelectItem value="lead">lead</SelectItem>
                                <SelectItem value="planejando">planj/gerado</SelectItem>
                                <SelectItem value="comprou">comprou</SelectItem>
                                <SelectItem value="planejamento_entregue">planj/entregue</SelectItem>
                                <SelectItem value="upsell_pago">upsell pago</SelectItem>
                                <SelectItem value="recusou">não quer</SelectItem>
                              </SelectContent>
                            </Select>
                            {getStatusBadge(lead)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsModalOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateLeadPrecisaMaisInfo?.(lead.id, !lead.precisa_mais_info)}
                              className="h-8 w-8 p-0"
                              title={lead.precisa_mais_info ? "Desmarcar 'Precisa mais info'" : "Marcar 'Precisa mais info'"}
                            >
                              <AlertCircle className={`h-4 w-4 ${lead.precisa_mais_info ? 'text-orange-600' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGeneratePersonalizedMessage(lead)}
                              className="h-8 w-8 p-0"
                              title="Gerar mensagem personalizada"
                            >
                              <MessageSquareText className="h-4 w-4 text-green-700" />
                            </Button>
                            {lead.planejamento_estrategico ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setPlanContent(lead.planejamento_estrategico || '');
                                    setPlanClientName(leadData.nome || 'Cliente');
                                    setPlanEmail(lead.email_usuario || undefined);
                                    setPlanModalOpen(true);
                                  }}
                                  className="h-8 px-2"
                                  title="Ver/Editar Planejamento"
                                >
                                  Ver/Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadPlanPdf({
                                    content: (lead.planejamento_estrategico as string) || '',
                                    title: `Consultoria Estratégica - Funil Interativo - ${leadData.nome}`,
                                    filename: `Planejamento-${leadData.nome}.pdf`
                                  })}
                                  className="h-8 px-2"
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGeneratePlan(lead)}
                                disabled={!!generating[lead.id]}
                                className="h-8 w-8 p-0"
                                title={generating[lead.id] ? 'Gerando...' : 'Gerar Planejamento'}
                              >
                                {generating[lead.id] ? (
                                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                ) : (
                                  <Wand2 className="h-4 w-4 text-purple-600" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleWhatsAppContact(lead)}
                              className="h-8 px-2"
                              title="Enviar mensagem de recuperação via API"
                            >
                              Recuperar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
      />

      {/* Modal de Planejamento */}
      <PlanejamentoPreviewModal
        isOpen={planModalOpen}
        onOpenChange={setPlanModalOpen}
        content={planContent || ''}
        title={`Consultoria Estratégica - Funil Interativo - ${planClientName}`}
        emailCliente={planEmail}
        onApproved={(finalContent) => {
          setPlanContent(finalContent);
          refetch?.();
        }}
      />

      <PersonalizedMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        message={personalizedMessage}
        clientName={personalizedClient.name}
        phone={personalizedClient.phone ?? null}
      />
    </>
  );
}
