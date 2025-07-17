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
    
    // Tratamento especial para casos conhecidos
    if (fieldName === 'etapaAtual' && typeof value === 'string') {
      const etapaMap: Record<string, string> = {
        'commission': 'Comissão',
        'planning': 'Planejamento',
        'approval': 'Aprovação',
        'setup': 'Configuração',
        'launch': 'Lançamento'
      };
      return <Badge className="text-xs">{etapaMap[value] || value}</Badge>;
    }
    
    if (fieldName === 'completedAt' && typeof value === 'string') {
      try {
        return <span>{format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>;
      } catch (error) {
        return <span>{value}</span>;
      }
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">Nenhum selecionado</span>;
      
      // Verificar se é um array de caracteres (como strings separadas)
      if (value.every(item => typeof item === 'string' && item.length === 1)) {
        return <span>{value.join('')}</span>;
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'number') {
      if (fieldName?.toLowerCase().includes('valor') || 
          fieldName?.toLowerCase().includes('preco') || 
          fieldName?.toLowerCase().includes('investimento') ||
          fieldName?.toLowerCase().includes('custo') ||
          fieldName?.toLowerCase().includes('total')) {
        return <span className="font-medium text-green-600">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>;
      }
      return <span className="font-medium">{value.toLocaleString('pt-BR')}</span>;
    }
    
    if (typeof value === 'string') {
      // Detectar URLs
      if (value.startsWith('http')) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {value}
          </a>
        );
      }
      
      // Detectar emails
      if (value.includes('@') && value.includes('.')) {
        return (
          <a href={`mailto:${value}`} className="text-primary hover:underline">
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
      
      // Tentar detectar valores que deveriam ser arrays/objetos mas foram convertidos para string
      if (value.startsWith('[') || value.startsWith('{')) {
        try {
          const parsed = JSON.parse(value);
          return renderValue(parsed, fieldName);
        } catch (e) {
          // Se não conseguir fazer o parse, renderiza como string normal
        }
      }
    }
    
    if (typeof value === 'object' && value !== null) {
      // Caso especial para breakdown de custos
      if (fieldName === 'breakdown' && Array.isArray(value)) {
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="bg-muted/30 p-2 rounded">
                {Object.entries(item).map(([itemKey, itemValue]) => (
                  <div key={itemKey} className="grid grid-cols-3 text-xs">
                    <span className="font-medium">{formatFieldName(itemKey)}:</span>
                    <span className="col-span-2">{renderValue(itemValue, itemKey)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="grid grid-cols-3">
              <span className="font-medium">{formatFieldName(key)}:</span>
              <span className="col-span-2">{renderValue(val, key)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  const formatFieldName = (key: string): string => {
    const fieldNames: { [key: string]: string } = {
      // Dados pessoais
      nome: 'Nome Completo',
      email: 'E-mail',
      whatsapp: 'WhatsApp',
      telefone: 'Telefone',
      idade: 'Idade',
      cidade: 'Cidade',
      estado: 'Estado',
      
      // Formação e experiência
      nivelEscolaridade: 'Nível de Escolaridade',
      experienciaEmpreendedorismo: 'Experiência em Empreendedorismo',
      conhecimentoMarketing: 'Conhecimento em Marketing Digital',
      experienciaTrafegoAgo: 'Experiência com Tráfego Pago',
      ferramentasConhecidas: 'Ferramentas que Conhece',
      
      // Negócio
      tipo: 'Tipo',
      tipoNegocio: 'Tipo de Negócio',
      setorAtuacao: 'Setor de Atuação',
      publicoAlvo: 'Público-Alvo',
      principaisServicos: 'Principais Serviços',
      diferencialCompetitivo: 'Diferencial Competitivo',
      storeType: 'Tipo de Loja',
      
      // Financeiro
      comissao: 'Comissão',
      rendaMensal: 'Renda Mensal Atual',
      valorInvestimento: 'Valor Disponível para Investimento',
      investimentoDiario: 'Investimento Diário',
      tempoRetorno: 'Tempo Esperado de Retorno',
      metaFaturamento: 'Meta de Faturamento',
      total: 'Total',
      breakdown: 'Detalhamento',
      
      // Objetivos
      principaisObjetivos: 'Principais Objetivos',
      maioresDesafios: 'Maiores Desafios',
      
      // Status e etapas
      etapaAtual: 'Etapa Atual',
      completedAt: 'Concluído em',
      
      // Infraestrutura
      hasBM: 'Possui Business Manager',
      hasCheckout: 'Possui Checkout',
      hasWhatsApp: 'Possui WhatsApp',
      hasImageCreatives: 'Possui Criativos de Imagem',
      hasVideoCreatives: 'Possui Criativos de Vídeo',
      
      // Publicidade
      advertisingProducts: 'Produtos Publicitários',
      totalCost: 'Custo Total'
    };
    
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Determina se um campo deve ser tratado como uma seção própria
  const shouldRenderAsSection = (key: string, value: any): boolean => {
    if (!value || typeof value !== 'object') return false;
    
    // Alguns campos específicos que sabemos que são objetos mas queremos tratar como um único valor
    const excludedKeys = ['breakdown', 'etapaAtual', 'completedAt'];
    if (excludedKeys.includes(key)) return false;
    
    return true;
  };

  const renderSection = (title: string, data: any, icon: React.ReactNode) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    // Manipulação especial para arrays que não são arrays de objetos
    if (Array.isArray(data) && !data.some(item => typeof item === 'object')) {
      return (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {renderValue(data, title)}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3 bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {Object.entries(data).map(([key, value]) => {
            // Se o valor for um objeto complexo que deve ser renderizado como sua própria seção
            if (shouldRenderAsSection(key, value)) {
              const sectionTitle = formatFieldName(key);
              return (
                <div key={key} className="border-b border-muted pb-3 last:border-b-0 last:pb-0">
                  <h4 className="font-semibold mb-2 text-primary">{sectionTitle}</h4>
                  <div className="pl-4">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                        <div className="font-semibold text-sm text-foreground md:col-span-1">
                          {formatFieldName(subKey)}:
                        </div>
                        <div className="md:col-span-3 text-sm">
                          {renderValue(subValue, subKey)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            // Renderização normal para valores simples
            return (
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
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const respostas = lead.respostas || {};

  // Identifica e processa campos especiais como arrays ou objetos com formatos específicos
  const processarRespostas = () => {
    // Se respostas for um array ou string simples, envolver em um objeto
    if (typeof respostas !== 'object' || Array.isArray(respostas)) {
      return { respostasPrincipais: respostas };
    }

    // Mapear campos especiais que sabemos que precisam de tratamento especial
    const camposEspeciais = {
      etapaAtual: respostas.etapaAtual,
      completedAt: respostas.completedAt,
      totalCost: respostas.totalCost,
      infraestrutura: {
        hasBM: respostas.hasBM,
        hasCheckout: respostas.hasCheckout,
        hasWhatsApp: respostas.hasWhatsApp,
        hasImageCreatives: respostas.hasImageCreatives,
        hasVideoCreatives: respostas.hasVideoCreatives
      }
    };
    
    // Filtrar apenas os campos que têm valores
    const camposEspeciaisComValores = Object.fromEntries(
      Object.entries(camposEspeciais.infraestrutura)
        .filter(([_, value]) => value !== undefined && value !== null)
    );
    
    // Adicionar seção de infraestrutura apenas se houver dados
    const resultado = { ...respostas };
    if (Object.keys(camposEspeciaisComValores).length > 0) {
      resultado.infraestrutura = camposEspeciaisComValores;
    }
    
    return resultado;
  };

  const respostasProcessadas = processarRespostas();

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
                    <p className="text-sm">
                      <a href={`mailto:${lead.email_usuario}`} className="text-primary hover:underline">
                        {lead.email_usuario}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Dados Pessoais */}
          {respostasProcessadas.dadosPersonais && renderSection(
            'Dados Pessoais',
            respostasProcessadas.dadosPersonais,
            <User className="h-5 w-5" />
          )}

          {/* Informações do Negócio */}
          {respostasProcessadas.negocio && renderSection(
            'Informações do Negócio',
            respostasProcessadas.negocio,
            <Building className="h-5 w-5" />
          )}

          {/* Infraestrutura */}
          {respostasProcessadas.infraestrutura && renderSection(
            'Infraestrutura',
            respostasProcessadas.infraestrutura,
            <Building className="h-5 w-5" />
          )}

          {/* Situação Financeira / Custos */}
          {respostasProcessadas.totalCost && renderSection(
            'Custos Totais',
            respostasProcessadas.totalCost,
            <DollarSign className="h-5 w-5" />
          )}

          {/* Etapa Atual */}
          {respostasProcessadas.etapaAtual && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg text-primary">
                  <Target className="h-5 w-5" />
                  Etapa Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="font-semibold text-sm text-foreground md:col-span-1">
                    Status:
                  </div>
                  <div className="md:col-span-3 text-sm">
                    {renderValue(respostasProcessadas.etapaAtual, 'etapaAtual')}
                  </div>
                </div>
                {respostasProcessadas.completedAt && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
                    <div className="font-semibold text-sm text-foreground md:col-span-1">
                      Concluído em:
                    </div>
                    <div className="md:col-span-3 text-sm">
                      {renderValue(respostasProcessadas.completedAt, 'completedAt')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Outras Seções Dinâmicas */}
          {Object.entries(respostasProcessadas).map(([key, value]) => {
            // Ignorar seções já tratadas especificamente
            if ([
              'dadosPersonais', 
              'negocio', 
              'infraestrutura', 
              'totalCost', 
              'etapaAtual', 
              'completedAt'
            ].includes(key)) {
              return null;
            }

            return renderSection(
              formatFieldName(key),
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