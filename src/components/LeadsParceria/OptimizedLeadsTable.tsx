import React, { memo, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, User, Eye, CheckCircle, Wand2, AlertCircle, MessageSquareText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lead {
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
  status_negociacao: string;
  vendedor_responsavel: string | null;
  distribuido_em: string | null;
  webhook_automatico?: boolean;
  precisa_mais_info?: boolean;
  data_compra?: string | null;
}

interface OptimizedLeadsTableProps {
  leads: Lead[];
  activeTab: 'leads' | 'compraram';
  statusFilter: string;
  showNeedsInfoOnly: boolean;
  purchasedStatuses: Set<string>;
  onViewDetails: (lead: Lead) => void;
  onToggleNeedsInfo: (leadId: string, value: boolean) => void;
  onGeneratePlan: (lead: Lead) => void;
  onGenerateMessage: (lead: Lead) => void;
  onWhatsAppContact: (lead: Lead) => void;
  onOpenRecoveryModal: (lead: Lead) => void;
  isEligibleForPlan: (lead: Lead) => boolean;
  getLeadData: (lead: Lead) => any;
  translateTipoNegocio: (tipo: string) => string;
  getRowClassName: (lead: Lead) => string;
  getStatusBadge: (lead: Lead) => React.ReactNode;
  generating: Record<string, boolean>;
}

// Memoized table row component for better performance
const TableRowMemo = memo(({ 
  lead, 
  onViewDetails, 
  onToggleNeedsInfo, 
  onGeneratePlan, 
  onGenerateMessage, 
  onWhatsAppContact, 
  onOpenRecoveryModal,
  isEligibleForPlan,
  getLeadData,
  translateTipoNegocio,
  getRowClassName,
  getStatusBadge,
  isGenerating,
  activeTab 
}: {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onToggleNeedsInfo: (leadId: string, value: boolean) => void;
  onGeneratePlan: (lead: Lead) => void;
  onGenerateMessage: (lead: Lead) => void;
  onWhatsAppContact: (lead: Lead) => void;
  onOpenRecoveryModal: (lead: Lead) => void;
  isEligibleForPlan: (lead: Lead) => boolean;
  getLeadData: (lead: Lead) => any;
  translateTipoNegocio: (tipo: string) => string;
  getRowClassName: (lead: Lead) => string;
  getStatusBadge: (lead: Lead) => React.ReactNode;
  isGenerating: boolean;
  activeTab: 'leads' | 'compraram';
}) => {
  const leadData = useMemo(() => getLeadData(lead), [lead, getLeadData]);
  const isEligible = useMemo(() => isEligibleForPlan(lead), [lead, isEligibleForPlan]);

  const handleViewDetails = useCallback(() => onViewDetails(lead), [lead, onViewDetails]);
  const handleToggleNeedsInfo = useCallback(() => onToggleNeedsInfo(lead.id, !lead.precisa_mais_info), [lead.id, lead.precisa_mais_info, onToggleNeedsInfo]);
  const handleGeneratePlan = useCallback(() => onGeneratePlan(lead), [lead, onGeneratePlan]);
  const handleGenerateMessage = useCallback(() => onGenerateMessage(lead), [lead, onGenerateMessage]);
  const handleWhatsAppContact = useCallback(() => {
    // Remove todos os caracteres não numéricos
    const cleanNumber = leadData.telefone.replace(/\D/g, '');
    // Adiciona código do país se necessário
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  }, [leadData.telefone]);
  
  const handleWhatsAppAPI = useCallback(() => onWhatsAppContact(lead), [lead, onWhatsAppContact]);
  const handleOpenRecoveryModal = useCallback(() => onOpenRecoveryModal(lead), [lead, onOpenRecoveryModal]);

  return (
    <TableRow key={lead.id} className={getRowClassName(lead)}>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium text-sm">{leadData.nome || 'Nome não informado'}</div>
          <div className="text-xs text-muted-foreground">{leadData.email}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(lead.created_at), 'dd/MM HH:mm', { locale: ptBR })}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm">{translateTipoNegocio(lead.tipo_negocio)}</div>
          <div className="text-xs text-muted-foreground">{leadData.telefone || 'Não informado'}</div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={lead.status_negociacao === 'comprou' ? 'default' : 'secondary'} className="text-xs">
            {lead.status_negociacao}
          </Badge>
          {getStatusBadge(lead)}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">{lead.vendedor_responsavel || 'Não atribuído'}</div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Checkbox
            checked={lead.precisa_mais_info || false}
            onCheckedChange={handleToggleNeedsInfo}
            className="w-4 h-4"
          />
          <span className="text-xs">{lead.precisa_mais_info ? 'Sim' : 'Não'}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-wrap gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="h-7 px-2"
          >
            <Eye className="w-3 h-3" />
          </Button>
          
          {activeTab === 'compraram' && isEligible && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="h-7 px-2"
            >
              <Wand2 className="w-3 h-3" />
            </Button>
          )}
          
          {leadData.telefone && leadData.telefone !== 'Não informado' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateMessage}
                className="h-7 px-2"
                title="Gerar mensagem personalizada"
              >
                <MessageSquareText className="w-3 h-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppContact}
                className="h-7 px-2"
                title="Abrir WhatsApp"
              >
                <MessageCircle className="w-3 h-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppAPI}
                className="h-7 px-2"
                title="Enviar via API"
              >
                <User className="w-3 h-3" />
              </Button>
              
              {activeTab === 'leads' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenRecoveryModal}
                  className="h-7 px-2"
                  title="Recuperação"
                >
                  <AlertCircle className="w-3 h-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

TableRowMemo.displayName = 'TableRowMemo';

export const OptimizedLeadsTable = memo(({
  leads,
  activeTab,
  statusFilter,
  showNeedsInfoOnly,
  purchasedStatuses,
  onViewDetails,
  onToggleNeedsInfo,
  onGeneratePlan,
  onGenerateMessage,
  onWhatsAppContact,
  onOpenRecoveryModal,
  isEligibleForPlan,
  getLeadData,
  translateTipoNegocio,
  getRowClassName,
  getStatusBadge,
  generating,
}: OptimizedLeadsTableProps) => {
  // Filter leads based on active tab and filters
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Filter by tab
    if (activeTab === 'leads') {
      filtered = filtered.filter(lead => !purchasedStatuses.has(lead.status_negociacao));
    } else {
      filtered = filtered.filter(lead => purchasedStatuses.has(lead.status_negociacao));
    }

    // Filter by status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(lead => lead.status_negociacao === statusFilter);
    }

    // Filter by needs more info
    if (showNeedsInfoOnly) {
      filtered = filtered.filter(lead => lead.precisa_mais_info);
    }

    return filtered;
  }, [leads, activeTab, statusFilter, showNeedsInfoOnly, purchasedStatuses]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Negócio</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Vendedor</TableHead>
          <TableHead>+ Info</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredLeads.map((lead) => (
          <TableRowMemo
            key={lead.id}
            lead={lead}
            activeTab={activeTab}
            onViewDetails={onViewDetails}
            onToggleNeedsInfo={onToggleNeedsInfo}
            onGeneratePlan={onGeneratePlan}
            onGenerateMessage={onGenerateMessage}
            onWhatsAppContact={onWhatsAppContact}
            onOpenRecoveryModal={onOpenRecoveryModal}
            isEligibleForPlan={isEligibleForPlan}
            getLeadData={getLeadData}
            translateTipoNegocio={translateTipoNegocio}
            getRowClassName={getRowClassName}
            getStatusBadge={getStatusBadge}
            isGenerating={!!generating[lead.id]}
          />
        ))}
      </TableBody>
    </Table>
  );
});

OptimizedLeadsTable.displayName = 'OptimizedLeadsTable';