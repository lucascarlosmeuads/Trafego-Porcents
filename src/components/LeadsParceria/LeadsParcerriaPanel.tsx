import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Calendar, User, Mail, Phone, BarChart3, Eye } from 'lucide-react';
import { LeadsParcerriaAnalytics } from './LeadsParcerriaAnalytics';
import { LeadDetailsModal } from './LeadDetailsModal';
import { useLeadsParceria } from '@/hooks/useLeadsParceria';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function LeadsParcerriaPanel() {
  const { leads, loading, totalLeads, updateLeadNegociacao, reatribuirLead } = useLeadsParceria();
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (lead.status_negociacao === 'aceitou') {
      return 'bg-green-100 hover:bg-green-200 border-l-4 border-l-green-500 text-green-900';
    }
    if (lead.status_negociacao === 'pensando') {
      return 'bg-blue-100 hover:bg-blue-200 border-l-4 border-l-blue-500 text-blue-900';
    }
    if (lead.status_negociacao === 'recusou') {
      return 'bg-red-100 hover:bg-red-200 border-l-4 border-l-red-500 text-red-900';
    }
    return '';
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

        {/* Dashboard de Analytics */}
        {showAnalytics && <LeadsParcerriaAnalytics />}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Lista de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data/Hora
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </TableHead>
                    <TableHead className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </TableHead>
                    <TableHead>Vendedor Responsável</TableHead>
                    <TableHead>Status Negociação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
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
                          <div className="flex items-center gap-2">
                            {lead.vendedor_responsavel ? (
                              <Select
                                value={lead.vendedor_responsavel}
                                onValueChange={(value) => reatribuirLead?.(lead.id, value === 'none' ? null : value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue>
                                    {lead.vendedor_responsavel === 'vendedoredu@trafegoporcents.com' && (
                                      <Badge variant="default" className="bg-green-500">Edu</Badge>
                                    )}
                                    {lead.vendedor_responsavel === 'vendedoritamar@trafegoporcents.com' && (
                                      <Badge variant="default" className="bg-blue-500">Itamar</Badge>
                                    )}
                                    {lead.vendedor_responsavel === 'vendedorjoao@trafegoporcents.com' && (
                                      <Badge variant="default" className="bg-orange-500">João</Badge>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Não Atribuído</SelectItem>
                                  <SelectItem value="vendedoredu@trafegoporcents.com">
                                    Edu
                                  </SelectItem>
                                  <SelectItem value="vendedoritamar@trafegoporcents.com">
                                    Itamar
                                  </SelectItem>
                                  <SelectItem value="vendedorjoao@trafegoporcents.com">
                                    João
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select
                                value="none"
                                onValueChange={(value) => reatribuirLead?.(lead.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Atribuir" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Não Atribuído</SelectItem>
                                  <SelectItem value="vendedoredu@trafegoporcents.com">
                                    Edu
                                  </SelectItem>
                                  <SelectItem value="vendedoritamar@trafegoporcents.com">
                                    Itamar
                                  </SelectItem>
                                  <SelectItem value="vendedorjoao@trafegoporcents.com">
                                    João
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status_negociacao || 'pendente'}
                            onValueChange={(value: 'pendente' | 'aceitou' | 'recusou' | 'pensando') => 
                              updateLeadNegociacao?.(lead.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">não chamei</SelectItem>
                              <SelectItem value="pensando">chamei</SelectItem>
                              <SelectItem value="aceitou">comprou</SelectItem>
                              <SelectItem value="recusou">não quer</SelectItem>
                            </SelectContent>
                          </Select>
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