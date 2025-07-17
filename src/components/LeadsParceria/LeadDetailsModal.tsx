import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, Mail, Phone, Building, DollarSign, Target, Lightbulb } from 'lucide-react';

interface LeadDetailsModalProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailsModal({ lead, isOpen, onClose }: LeadDetailsModalProps) {
  if (!lead) return null;

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'Não informado';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Nenhum';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderSection = (title: string, data: any, icon: React.ReactNode) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="font-medium text-sm text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </div>
              <div className="md:col-span-2 text-sm">
                {typeof value === 'object' && value !== null ? (
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  renderValue(value)
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const respostas = lead.respostas || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Lead
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Data do Cadastro:</span>
                  <p className="text-sm">
                    {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Tipo de Negócio:</span>
                  <p className="text-sm">{lead.tipo_negocio}</p>
                </div>
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Status:</span>
                  <Badge variant={lead.completo ? 'default' : 'secondary'}>
                    {lead.completo ? 'Completo' : 'Incompleto'}
                  </Badge>
                </div>
                {lead.email_usuario && (
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Email do Usuário:</span>
                    <p className="text-sm">{lead.email_usuario}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Dados Pessoais */}
          {respostas.dadosPersonais && renderSection(
            'Dados Pessoais',
            respostas.dadosPersonais,
            <User className="h-5 w-5" />
          )}

          {/* Informações do Negócio */}
          {respostas.informacoesNegocio && renderSection(
            'Informações do Negócio',
            respostas.informacoesNegocio,
            <Building className="h-5 w-5" />
          )}

          {/* Situação Financeira */}
          {respostas.situacaoFinanceira && renderSection(
            'Situação Financeira',
            respostas.situacaoFinanceira,
            <DollarSign className="h-5 w-5" />
          )}

          {/* Objetivos e Metas */}
          {respostas.objetivosMetas && renderSection(
            'Objetivos e Metas',
            respostas.objetivosMetas,
            <Target className="h-5 w-5" />
          )}

          {/* Conhecimento e Experiência */}
          {respostas.conhecimentoExperiencia && renderSection(
            'Conhecimento e Experiência',
            respostas.conhecimentoExperiencia,
            <Lightbulb className="h-5 w-5" />
          )}

          {/* Outras Seções Dinâmicas */}
          {Object.entries(respostas).map(([key, value]) => {
            if (['dadosPersonais', 'informacoesNegocio', 'situacaoFinanceira', 'objetivosMetas', 'conhecimentoExperiencia'].includes(key)) {
              return null;
            }

            return renderSection(
              key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              value,
              <Lightbulb className="h-5 w-5" />
            );
          })}

          {/* Planejamento Estratégico (se existir) */}
          {lead.planejamento_estrategico && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Planejamento Estratégico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{lead.planejamento_estrategico}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}