import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Calendar, User, Mail, Phone, Eye, AlertCircle, Users, DollarSign } from 'lucide-react';
import { LeadDetailsModal } from '@/components/LeadsParceria/LeadDetailsModal';
import { useVendedorLeads } from '@/hooks/useVendedorLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function VendedorLeadsPanel() {
  const { leads, loading, totalLeads, updateLeadNegociacao } = useVendedorLeads();
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWhatsAppClick = (whatsapp: string) => {
    // Remove todos os caracteres não numéricos
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanWhatsapp}`;
    window.open(url, '_blank');
  };

  const getLeadData = (lead: any) => {
    const respostas = lead.respostas || {};
    return {
      nome: respostas.dadosPersonais?.nome || respostas.nomeCompleto || respostas.nome || 'Nome não informado',
      email: lead.email_usuario || 'Email não informado',
      whatsapp: respostas.whatsapp || respostas.telefone || 'Não informado'
    };
  };

  const translateTipoNegocio = (tipo: string) => {
    const traducoes = {
      'digital': 'Digital',
      'physical': 'Físico',
      'service': 'Serviço'
    };
    return traducoes[tipo as keyof typeof traducoes] || tipo;
  };

  const getRowClassName = (lead: any) => {
    if (lead.cliente_pago) return 'bg-green-50 hover:bg-green-100 border-green-200';
    if (lead.status_negociacao === 'aceitou') return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
    if (lead.status_negociacao === 'recusou') return 'bg-red-50 hover:bg-red-100 border-red-200';
    return '';
  };

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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meus Leads Atribuídos
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
                    <TableHead>Status Negociação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const leadData = getLeadData(lead);
                    return (
                      <TableRow key={lead.id} className={getRowClassName(lead)}>
                        <TableCell className="text-sm">
                          {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {leadData.nome}
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
                        <TableCell>
                          <Select
                            value={lead.status_negociacao}
                            onValueChange={(value) => updateLeadNegociacao(lead.id, value as any)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">
                                <Badge variant="secondary">Pendente</Badge>
                              </SelectItem>
                              <SelectItem value="aceitou">
                                <Badge variant="default" className="bg-green-500">Aceitou</Badge>
                              </SelectItem>
                              <SelectItem value="pensando">
                                <Badge variant="outline">Pensando</Badge>
                              </SelectItem>
                              <SelectItem value="recusou">
                                <Badge variant="destructive">Recusou</Badge>
                              </SelectItem>
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
                  {leads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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