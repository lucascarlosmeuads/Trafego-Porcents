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
import { 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Building, 
  DollarSign, 
  Target, 
  Lightbulb, 
  FileText,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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

  // Organizar dados em seções estratégicas
  const organizarDadosEstrategicos = () => {
    // Extrair dados pessoais
    const dadosPersonais = {
      nome: respostas.nome,
      email: respostas.email,
      whatsapp: respostas.whatsapp,
      telefone: respostas.telefone,
      idade: respostas.idade,
      cidade: respostas.cidade,
      estado: respostas.estado
    };

    // Extrair informações financeiras
    const financeiro = {
      rendaMensal: respostas.rendaMensal,
      valorInvestimento: respostas.valorInvestimento,
      investimentoDiario: respostas.investimentoDiario,
      tempoRetorno: respostas.tempoRetorno,
      metaFaturamento: respostas.metaFaturamento,
      comissao: respostas.comissao,
      totalCost: respostas.totalCost,
      breakdown: respostas.breakdown
    };

    // Extrair infraestrutura atual
    const infraestrutura = {
      hasBM: respostas.hasBM,
      hasCheckout: respostas.hasCheckout,
      hasWhatsApp: respostas.hasWhatsApp,
      hasImageCreatives: respostas.hasImageCreatives,
      hasVideoCreatives: respostas.hasVideoCreatives,
      advertisingProducts: respostas.advertisingProducts
    };

    // Extrair informações do negócio
    const negocio = {
      tipoNegocio: respostas.tipoNegocio,
      setorAtuacao: respostas.setorAtuacao,
      publicoAlvo: respostas.publicoAlvo,
      principaisServicos: respostas.principaisServicos,
      diferencialCompetitivo: respostas.diferencialCompetitivo,
      storeType: respostas.storeType,
      principaisObjetivos: respostas.principaisObjetivos,
      maioresDesafios: respostas.maioresDesafios
    };

    // Extrair experiência e conhecimentos
    const experiencia = {
      nivelEscolaridade: respostas.nivelEscolaridade,
      experienciaEmpreendedorismo: respostas.experienciaEmpreendedorismo,
      conhecimentoMarketing: respostas.conhecimentoMarketing,
      experienciaTrafegoAgo: respostas.experienciaTrafegoAgo,
      ferramentasConhecidas: respostas.ferramentasConhecidas
    };

    // Filtrar seções que possuem dados válidos
    const filtrarSecao = (secao: any) => {
      return Object.fromEntries(
        Object.entries(secao).filter(([_, value]) => 
          value !== undefined && value !== null && value !== '' && 
          !(Array.isArray(value) && value.length === 0)
        )
      );
    };

    return {
      dadosPersonais: filtrarSecao(dadosPersonais),
      financeiro: filtrarSecao(financeiro),
      infraestrutura: filtrarSecao(infraestrutura),
      negocio: filtrarSecao(negocio),
      experiencia: filtrarSecao(experiencia),
      outras: Object.fromEntries(
        Object.entries(respostas).filter(([key]) => 
          !['nome', 'email', 'whatsapp', 'telefone', 'idade', 'cidade', 'estado',
            'rendaMensal', 'valorInvestimento', 'investimentoDiario', 'tempoRetorno', 
            'metaFaturamento', 'comissao', 'totalCost', 'breakdown',
            'hasBM', 'hasCheckout', 'hasWhatsApp', 'hasImageCreatives', 'hasVideoCreatives', 'advertisingProducts',
            'tipoNegocio', 'setorAtuacao', 'publicoAlvo', 'principaisServicos', 'diferencialCompetitivo', 
            'storeType', 'principaisObjetivos', 'maioresDesafios',
            'nivelEscolaridade', 'experienciaEmpreendedorismo', 'conhecimentoMarketing', 
            'experienciaTrafegoAgo', 'ferramentasConhecidas'
          ].includes(key)
        )
      )
    };
  };

  const dadosOrganizados = organizarDadosEstrategicos();

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
          {/* SEÇÃO 1: RESUMO ESTRATÉGICO */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6 text-primary" />
                Resumo Estratégico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Status do Lead
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.completo ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <Badge variant={lead.completo ? 'default' : 'secondary'} className="text-sm">
                      {lead.completo ? 'Formulário Completo' : 'Formulário Incompleto'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                
                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <Building className="h-4 w-4" />
                    Tipo de Negócio
                  </div>
                  <Badge variant="outline" className="text-sm font-medium">
                    {lead.tipo_negocio}
                  </Badge>
                </div>

                {lead.email_usuario && (
                  <div className="bg-background/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Mail className="h-4 w-4" />
                      Contato
                    </div>
                    <a href={`mailto:${lead.email_usuario}`} className="text-primary hover:underline text-sm font-medium">
                      {lead.email_usuario}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 2: DESCRIÇÃO DO PRODUTO/SERVIÇO */}
          {lead.planejamento_estrategico && (
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-6 w-6 text-orange-600" />
                  Descrição do Produto/Serviço
                  <Badge className="bg-orange-100 text-orange-800 text-xs">ESTRATÉGICO</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 p-4 rounded-lg border border-orange-100">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {lead.planejamento_estrategico}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEÇÃO 3: DADOS PESSOAIS */}
          {Object.keys(dadosOrganizados.dadosPersonais).length > 0 && renderSection(
            'Dados Pessoais',
            dadosOrganizados.dadosPersonais,
            <User className="h-5 w-5" />
          )}

          {/* SEÇÃO 4: SITUAÇÃO FINANCEIRA */}
          {Object.keys(dadosOrganizados.financeiro).length > 0 && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Situação Financeira
                  <Badge className="bg-green-100 text-green-800 text-xs">IMPORTANTE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(dadosOrganizados.financeiro).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-white/50 p-3 rounded border border-green-100">
                    <div className="font-semibold text-sm text-foreground md:col-span-1">
                      {formatFieldName(key)}:
                    </div>
                    <div className="md:col-span-3 text-sm">
                      {renderValue(value, key)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SEÇÃO 5: INFRAESTRUTURA ATUAL */}
          {Object.keys(dadosOrganizados.infraestrutura).length > 0 && (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Infraestrutura Atual
                  <Badge className="bg-blue-100 text-blue-800 text-xs">TÉCNICO</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(dadosOrganizados.infraestrutura).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 bg-white/50 p-3 rounded border border-blue-100">
                      <div className="flex-shrink-0">
                        {value ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{formatFieldName(key)}</div>
                        <div className="text-xs text-muted-foreground">
                          {value ? 'Já possui' : 'Precisa configurar'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEÇÃO 6: INFORMAÇÕES DO NEGÓCIO */}
          {Object.keys(dadosOrganizados.negocio).length > 0 && renderSection(
            'Informações do Negócio',
            dadosOrganizados.negocio,
            <Building className="h-5 w-5" />
          )}

          {/* SEÇÃO 7: EXPERIÊNCIA E CONHECIMENTOS */}
          {Object.keys(dadosOrganizados.experiencia).length > 0 && renderSection(
            'Experiência e Conhecimentos',
            dadosOrganizados.experiencia,
            <Lightbulb className="h-5 w-5" />
          )}

          {/* SEÇÃO 8: OUTRAS INFORMAÇÕES */}
          {Object.keys(dadosOrganizados.outras).length > 0 && Object.entries(dadosOrganizados.outras).map(([key, value]) => {
            if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null;

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