import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Calendar, User, Mail, Phone, BarChart3, Eye, CheckCircle, Wand2, Download } from 'lucide-react';
import { LeadsParcerriaAnalytics } from './LeadsParcerriaAnalytics';
import { LeadDetailsModal } from './LeadDetailsModal';
import { useLeadsParceria } from '@/hooks/useLeadsParceria';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { useGlobalDateFilter, type DateFilterOption } from '@/hooks/useGlobalDateFilter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlanejamentoPreviewModal } from './PlanejamentoPreviewModal';
import { downloadPlanPdf } from '@/utils/planDownload';

export function LeadsParcerriaPanel() {
  const { currentFilter } = useGlobalDateFilter();
  
  // Create stable filter object to prevent infinite loops
  const stableFilterDates = useMemo(() => ({
    startDate: currentFilter.startDate,
    endDate: currentFilter.endDate,
    option: currentFilter.option
  }), [currentFilter.startDate, currentFilter.endDate, currentFilter.option]);
  
  const { leads, loading, totalLeads, updateLeadNegociacao, refetch } = useLeadsParceria(stableFilterDates);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planContent, setPlanContent] = useState<string | null>(null);
  const [planClientName, setPlanClientName] = useState<string>('Cliente');
  const [planEmail, setPlanEmail] = useState<string | undefined>(undefined);
  const { toast } = useToast();

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
    // Só mostra "Comprou (Automático)" se foi realmente via webhook
    if (lead.status_negociacao === 'comprou' && lead.cliente_pago && lead.webhook_automatico) {
      return (
        <Badge className="bg-green-600 text-white">
          ✅ Comprou (Automático)
        </Badge>
      );
    }
    return null;
  };


  const filteredLeads = statusFilter === 'todos' 
    ? leads 
    : leads.filter(lead => (lead.status_negociacao || 'lead') === statusFilter);

  const handleGeneratePlan = async (lead: any) => {
    try {
      setGenerating(prev => ({ ...prev, [lead.id]: true }));

      const { data, error } = await supabase.functions.invoke('generate-gamified-funnel', {
        body: { leadId: lead.id }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha ao gerar planejamento');

      toast({ title: 'Planejamento gerado', description: 'Planejamento estratégico criado com sucesso.' });
      setPlanContent(data.planejamento);
      const leadData = getLeadData(lead);
      setPlanClientName(leadData.nome || 'Cliente');
      setPlanEmail(lead.email_usuario || undefined);
      setPlanModalOpen(true);
      // Atualiza status localmente
      updateLeadNegociacao?.(lead.id, 'planejamento_entregue');
    } catch (err: any) {
      console.error('Erro ao gerar planejamento:', err);
      toast({ title: 'Erro', description: 'Não foi possível gerar o planejamento.', variant: 'destructive' });
    } finally {
      setGenerating(prev => ({ ...prev, [lead.id]: false }));
    }
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
            <h1 className="text-3xl font-bold">Leads de Parceria</h1>
            <p className="text-muted-foreground">
              Gerencie todos os leads interessados em parceria
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showAnalytics ? 'Ocultar' : 'Mostrar'} Analytics
            </Button>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {totalLeads} {totalLeads === 1 ? 'Lead' : 'Leads'}
            </Badge>
          </div>
        </div>

        {/* Filtro de Data Centralizado */}
        <DateRangeFilter />

        {/* Dashboard de Analytics */}
        {showAnalytics && <LeadsParcerriaAnalytics dateFilter={stableFilterDates} />}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Lista de Leads
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrar por status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="lead">lead</SelectItem>
                    <SelectItem value="planejando">planejando</SelectItem>
                    <SelectItem value="comprou">comprou</SelectItem>
                    <SelectItem value="planejamento_entregue">planejamento entregue</SelectItem>
                    <SelectItem value="upsell_pago">upsell pago</SelectItem>
                    <SelectItem value="recusou">não quer</SelectItem>
                  </SelectContent>
                </Select>
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
                              onValueChange={(value: 'lead' | 'comprou' | 'recusou' | 'planejando' | 'planejamento_entregue' | 'upsell_pago') => 
                                updateLeadNegociacao?.(lead.id, value)
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lead">lead</SelectItem>
                                <SelectItem value="planejando">planejando</SelectItem>
                                <SelectItem value="comprou">comprou</SelectItem>
                                <SelectItem value="planejamento_entregue">planejamento entregue</SelectItem>
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
    </>
  );
}