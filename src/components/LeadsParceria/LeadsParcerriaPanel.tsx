import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Eye, Calendar, User, Mail, Phone, BarChart3 } from 'lucide-react';
import { LeadDetailsModal } from './LeadDetailsModal';
import { LeadsParcerriaAnalytics } from './LeadsParcerriaAnalytics';
import { useLeadsParceria } from '@/hooks/useLeadsParceria';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function LeadsParcerriaPanel() {
  const { leads, loading, totalLeads, updateLeadStatus, updateLeadNegociacao } = useLeadsParceria();
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const handleWhatsAppClick = (whatsapp: string) => {
    // Remove todos os caracteres não numéricos
    const cleanNumber = whatsapp.replace(/\D/g, '');
    
    // Adiciona código do país se necessário
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const getLeadData = (lead: any) => {
    const respostas = lead.respostas || {};
    
    return {
      nome: respostas.dadosPersonais?.nome || respostas.nome || 'Não informado',
      email: respostas.dadosPersonais?.email || respostas.email || 'Não informado',
      whatsapp: respostas.dadosPersonais?.whatsapp || respostas.whatsapp || respostas.telefone || 'Não informado'
    };
  };

  const getRowClassName = (lead: any) => {
    if (lead.cliente_pago || lead.status_negociacao === 'aceitou') {
      return 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500';
    }
    if (lead.status_negociacao === 'pensando') {
      return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-500';
    }
    if (lead.status_negociacao === 'recusou') {
      return 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500';
    }
    if (lead.contatado_whatsapp) {
      return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500';
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
                    <TableHead>Contatado</TableHead>
                    <TableHead>Status Negociação</TableHead>
                    <TableHead>Pago</TableHead>
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
                            {lead.tipo_negocio}
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
                          <Switch
                            checked={lead.contatado_whatsapp || false}
                            onCheckedChange={(checked) => updateLeadStatus?.(lead.id, 'contatado_whatsapp', checked)}
                          />
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
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="pensando">Pensando</SelectItem>
                              <SelectItem value="aceitou">Aceitou</SelectItem>
                              <SelectItem value="recusou">Recusou</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={lead.cliente_pago || false}
                            onCheckedChange={(checked) => updateLeadStatus?.(lead.id, 'cliente_pago', checked)}
                            disabled={lead.status_negociacao === 'aceitou'} // Auto marcado quando aceita
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(lead)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
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