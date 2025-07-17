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

  const renderValue = (value: any, fieldName?: string): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">Não informado</span>;
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">Nenhum selecionado</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'number') {
      if (fieldName?.toLowerCase().includes('valor') || fieldName?.toLowerCase().includes('preco') || fieldName?.toLowerCase().includes('investimento')) {
        return <span className="font-medium text-green-600">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>;
      }
      return <span className="font-medium">{value.toLocaleString('pt-BR')}</span>;
    }
    
    if (typeof value === 'string') {
      // Detectar URLs
      if (value.startsWith('http')) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {value}
          </a>
        );
      }
      
      // Detectar emails
      if (value.includes('@') && value.includes('.')) {
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        );
      }
      
      // Detectar telefones/WhatsApp
      if (fieldName?.toLowerCase().includes('whatsapp') || fieldName?.toLowerCase().includes('telefone')) {
        const cleanNumber = value.replace(/\D/g, '');
        return (
          <div className="flex items-center gap-2">
            <span>{value}</span>
            {cleanNumber && (
              <a 
                href={`https://wa.me/55${cleanNumber}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-xs"
              >
                (Abrir WhatsApp)
              </a>
            )}
          </div>
        );
      }
    }
    
    if (typeof value === 'object') {
      return (
        <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  const formatFieldName = (key: string): string => {
    const fieldNames: { [key: string]: string } = {
      nome: 'Nome Completo',
      email: 'E-mail',
      whatsapp: 'WhatsApp',
      telefone: 'Telefone',
      idade: 'Idade',
      cidade: 'Cidade',
      estado: 'Estado',
      nivelEscolaridade: 'Nível de Escolaridade',
      experienciaEmpreendedorismo: 'Experiência em Empreendedorismo',
      tipoNegocio: 'Tipo de Negócio',
      setorAtuacao: 'Setor de Atuação',
      publicoAlvo: 'Público-Alvo',
      principaisServicos: 'Principais Serviços',
      diferencialCompetitivo: 'Diferencial Competitivo',
      rendaMensal: 'Renda Mensal Atual',
      valorInvestimento: 'Valor Disponível para Investimento',
      tempoRetorno: 'Tempo Esperado de Retorno',
      metaFaturamento: 'Meta de Faturamento',
      principaisObjetivos: 'Principais Objetivos',
      maioresDesafios: 'Maiores Desafios',
      conhecimentoMarketing: 'Conhecimento em Marketing Digital',
      experienciaTrafegoAgo: 'Experiência com Tráfego Pago',
      ferramentsConhecidas: 'Ferramentas que Conhece'
    };
    
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const renderSection = (title: string, data: any, icon: React.ReactNode) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3 bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-b border-muted pb-3 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="font-semibold text-sm text-foreground md:col-span-1">
                  {formatFieldName(key)}:
                </div>
                <div className="md:col-span-3 text-sm">
                  {renderValue(value, key)}
                </div>
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