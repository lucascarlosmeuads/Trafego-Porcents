import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle, Calendar, User, Mail, Phone, Eye, AlertCircle, Users, DollarSign, Package, TrendingUp, CheckCircle2 } from 'lucide-react';
import { LeadDetailsModal } from '@/components/LeadsParceria/LeadDetailsModal';
import { LeadsExportButton } from './LeadsExportButton';
import { useVendedorLeads } from '@/hooks/useVendedorLeads';
import { extractLeadData, isLeadComplete, getLeadPriority, translateStatus } from '@/utils/leadDataExtractor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function VendedorLeadsPanel() {
  const { leads, loading, totalLeads, updateLeadNegociacao } = useVendedorLeads();
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'leads' | 'compraram'>('leads');

  const handleWhatsAppClick = (whatsapp: string) => {
    // Remove todos os caracteres não numéricos
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanWhatsapp}`;
    window.open(url, '_blank');
  };

  const getLeadData = (lead: any) => {
    return extractLeadData(lead);
  };

  const getRowClassName = (lead: any) => {
    const baseClass = isLeadComplete(lead) ? 'border-l-2 border-l-green-400' : 'border-l-2 border-l-gray-300';
    
    if (lead.status_negociacao === 'comprou') {
      return `bg-green-100 hover:bg-green-200 border-l-4 border-l-green-500 text-green-900 ${baseClass}`;
    }
    if (lead.status_negociacao === 'planejando') {
      return `bg-blue-100 hover:bg-blue-200 border-l-4 border-l-blue-500 text-blue-900 ${baseClass}`;
    }
    if (lead.status_negociacao === 'planejamento_entregue') {
      return `bg-purple-100 hover:bg-purple-200 border-l-4 border-l-purple-500 text-purple-900 ${baseClass}`;
    }
    if (lead.status_negociacao === 'upsell_pago') {
      return `bg-emerald-100 hover:bg-emerald-200 border-l-4 border-l-emerald-500 text-emerald-900 ${baseClass}`;
    }
    if (lead.status_negociacao === 'recusou') {
      return `bg-red-100 hover:bg-red-200 border-l-4 border-l-red-500 text-red-900 ${baseClass}`;
    }
    return baseClass;
  };

  const getStatusBadge = (lead: any) => {
    // Só mostra "automático" se foi realmente via webhook
    if (lead.status_negociacao === 'comprou' && lead.cliente_pago && lead.webhook_automatico) {
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 ml-1">
          automático
        </Badge>
      );
    }
    return null;
  };

  // Ordenar leads por prioridade (mais completos primeiro) e depois por data
  const sortedLeads = [...leads].sort((a, b) => {
    const priorityDiff = getLeadPriority(b) - getLeadPriority(a);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const baseLeads = useMemo(() => {
    return sortedLeads.filter(l => (activeTab === 'compraram' ? (l.status_negociacao === 'comprou') : (l.status_negociacao !== 'comprou')));
  }, [sortedLeads, activeTab]);

  const filteredLeads = useMemo(() => {
    if (activeTab === 'compraram') return baseLeads;
    if (statusFilter === 'todos') return baseLeads;
    return baseLeads.filter(lead => (lead.status_negociacao || 'lead') === statusFilter);
  }, [baseLeads, statusFilter, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads de Parceria</h1>
            <p className="text-muted-foreground">
              Gerencie os leads atribuídos a você ({totalLeads} leads)
            </p>
          </div>
        </div>

        {/* Instruções para Vendedores */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              📋 Instruções para Abordagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-700">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🎯 Como Abordar:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Clique em <Eye className="inline h-3 w-3 mx-1" /> "Ver Detalhes" para analisar completamente o lead</li>
                  <li>• Entre em contato via WhatsApp demonstrando interesse real no negócio</li>
                  <li>• Use as informações do formulário para personalizar a abordagem</li>
                  <li>• Demonstre conhecimento sobre o negócio deles</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💰 Processo de Vendas:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Planejamento Estratégico:</strong> Valor inicial (consulte tabela)</li>
                  <li>• <strong>Estrutura de Venda:</strong> R$ 250 - R$ 2.000 (conforme necessidade)</li>
                  <li>• Explique que são duas etapas separadas</li>
                  <li>• Foque no valor que vamos entregar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Meus Leads Atribuídos
              </div>
              <div className="flex items-center gap-3">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'leads' | 'compraram')}>
                  <TabsList>
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                    <TabsTrigger value="compraram">Compraram</TabsTrigger>
                  </TabsList>
                </Tabs>
                {activeTab === 'leads' && (
                  <>
                    <LeadsExportButton />
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
                          <SelectItem value="planejamento_entregue">planejamento entregue</SelectItem>
                          <SelectItem value="upsell_pago">upsell pago</SelectItem>
                          <SelectItem value="recusou">não quer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data/Hora
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nome
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        WhatsApp
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Produto
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Valor Médio
                      </div>
                    </TableHead>
                    <TableHead>Status Negociação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const leadData = getLeadData(lead);
                    return (
                      <TableRow key={lead.id} className={getRowClassName(lead)}>
                        <TableCell className="text-sm">
                          {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-2">
                                  {leadData.nome}
                                  {isLeadComplete(lead) && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p><strong>Tipo:</strong> {leadData.tipoNegocio}</p>
                                  <p><strong>Vendas anteriores:</strong> {leadData.jaTevVendas}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-sm">
                          {leadData.email}
                        </TableCell>
                        <TableCell>
                          {leadData.whatsapp !== 'Não informado' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWhatsAppClick(leadData.whatsapp)}
                              className="h-7 px-2 text-xs"
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Chamar
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">Não informado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-32">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="truncate text-xs">
                                  {leadData.produtoDescricao}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-64 text-xs">{leadData.produtoDescricao}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium">{leadData.valorMedio}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Select
                              value={lead.status_negociacao}
                              onValueChange={(value) => updateLeadNegociacao(lead.id, value as any)}
                            >
                              <SelectTrigger className="w-32">
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsModalOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum lead atribuído a você ainda.
                      </TableCell>
                    </TableRow>
                  )}
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
    </>
  );
}