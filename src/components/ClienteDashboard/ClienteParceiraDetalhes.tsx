
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  DollarSign, 
  Target, 
  Lightbulb, 
  FileText,
  CheckCircle,
  AlertCircle,
  Edit3,
  AlertTriangle,
  TrendingUp,
  Calculator,
  CreditCard,
  ShoppingCart,
  MessageSquare,
  Monitor,
  Video,
  Calendar,
  MapPin,
  Star,
  Activity
} from 'lucide-react';
import { FormularioParceiraData, ConsolidatedParceiraData } from '@/hooks/useClienteParceiraData';

interface ClienteParceiraDetalhesProps {
  formulario: FormularioParceiraData | null;
  dadosConsolidados?: ConsolidatedParceiraData | null;
  activeTab?: string;
}

export function ClienteParceiraDetalhes({ formulario, dadosConsolidados, activeTab = 'dashboard' }: ClienteParceiraDetalhesProps) {
  const dados = dadosConsolidados || null;

  // Function declaration for proper hoisting
  function formatFieldName(key: string): string {
    const fieldNames: { [key: string]: string } = {
      nome: 'Nome',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telefone: 'Telefone',
      tipo_negocio: 'Tipo de Negócio',
      produto_descricao: 'Produto/Serviço',
      valor_medio_produto: 'Valor Médio',
      ja_teve_vendas: 'Já teve vendas?',
      visao_futuro_texto: 'Visão de Futuro',
      audio_visao_futuro: 'Áudio - Visão',
      planejamento_estrategico: 'Planejamento',
      status_negociacao: 'Status',
      vendedor_responsavel: 'Vendedor',
      investimento_diario: 'Investimento Diário',
      hasBM: 'Business Manager',
      hasCheckout: 'Sistema de Checkout',
      hasWhatsApp: 'WhatsApp Business',
      hasImageCreatives: 'Criativos de Imagem (3 unidades)',
      hasVideoCreatives: 'Criativos de Vídeo (3 unidades)',
      hasSalesPage: 'Página de Vendas Simples',
      hasWhatsAppAutomation: 'Funil de Mensagens Automáticas'
    };
    
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  const calcularCustos = () => {
    const respostas = dados?.dados_completos || formulario?.respostas || {};
    
    const custos = {
      imageCreativesCost: respostas.hasImageCreatives === false ? 50 : 0,
      videoCreativesCost: respostas.hasVideoCreatives === false ? 100 : 0,
      bmCost: respostas.hasBM === false ? 200 : 0,
      salesPageCost: respostas.hasSalesPage === false ? 100 : 0,
      whatsappAutomationCost: respostas.hasWhatsAppAutomation === false ? 700 : 0
    };
    
    const total = Object.values(custos).reduce((sum, cost) => sum + cost, 0);
    
    // Calcular economias (itens que o cliente já possui)
    const economias = {
      imageCreativesSavings: respostas.hasImageCreatives === true ? 50 : 0,
      videoCreativesSavings: respostas.hasVideoCreatives === true ? 100 : 0,
      bmSavings: respostas.hasBM === true ? 200 : 0,
      salesPageSavings: respostas.hasSalesPage === true ? 100 : 0,
      whatsappAutomationSavings: respostas.hasWhatsAppAutomation === true ? 700 : 0
    };
    
    const totalEconomias = Object.values(economias).reduce((sum, saving) => sum + saving, 0);
    
    return {
      ...custos,
      ...economias,
      total,
      totalEconomias,
      hasDiscounts: totalEconomias > 0
    };
  };

  const renderValue = (value: any, fieldName?: string): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground text-sm">Não informado</span>;
    }
    
    if (fieldName === 'audio_visao_futuro' && typeof value === 'string' && value) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 font-medium text-sm">Áudio disponível</span>
          <audio controls className="ml-auto max-w-48">
            <source src={value} type="audio/mpeg" />
            <source src={value} type="audio/webm" />
            <source src={value} type="audio/wav" />
            Seu navegador não suporta áudio.
          </audio>
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground text-sm">Nenhum</span>;
      
      return (
        <div className="flex flex-wrap gap-1 max-w-80">
          {value.slice(0, 3).map((item, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 3} mais
            </Badge>
          )}
        </div>
      );
    }
    
    if (typeof value === 'number') {
      if (fieldName?.toLowerCase().includes('valor') || 
          fieldName?.toLowerCase().includes('preco') || 
          fieldName?.toLowerCase().includes('investimento')) {
        return <span className="font-semibold text-green-600">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>;
      }
      return <span className="font-medium">{value.toLocaleString('pt-BR')}</span>;
    }
    
    if (typeof value === 'string') {
      if (value.includes('@') && value.includes('.')) {
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline text-sm">
            {value}
          </a>
        );
      }
      
      if (fieldName?.toLowerCase().includes('whatsapp') || fieldName?.toLowerCase().includes('telefone')) {
        const cleanNumber = value.replace(/\D/g, '');
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{value}</span>
            {cleanNumber && (
              <a 
                href={`https://wa.me/55${cleanNumber}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-xs underline"
              >
                WhatsApp
              </a>
            )}
          </div>
        );
      }
      
      if (value.length > 100) {
        return (
          <div className="space-y-2">
            <p className="text-sm">{value.substring(0, 100)}...</p>
            <Button variant="outline" size="sm" className="h-6 text-xs">
              Ver completo
            </Button>
          </div>
        );
      }
    }
    
    return <span className="text-sm">{String(value)}</span>;
  };

  const custosInfo = calcularCustos();

  if (!dados && !formulario) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="pt-12 pb-12">
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados não encontrados</h3>
            <p className="text-muted-foreground">Não foi possível carregar suas informações de parceria.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const porcentagemCompletude = dados?.porcentagem_completude || 0;

  if (porcentagemCompletude < 80) {
    const dadosDisponiveis = {
      nome: dados?.nome_cliente || (formulario?.respostas?.nome) || 'Não informado',
      email: dados?.email_cliente || formulario?.email_usuario || 'Não informado',
      telefone: dados?.telefone || (formulario?.respostas?.telefone) || 'Não informado',
      tipo_negocio: dados?.tipo_negocio || formulario?.tipo_negocio || 'service',
    };

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Formulário Incompleto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do formulário</span>
                <span className="font-semibold">{porcentagemCompletude}%</span>
              </div>
              <Progress value={porcentagemCompletude} className="h-3" />
            </div>
            <p className="text-sm text-amber-700">
              Complete seu formulário para ter acesso completo ao painel e receber seu planejamento estratégico personalizado.
            </p>
            <Button 
              onClick={() => window.open('https://forms.gle/7bWM76eZV4JvnpHx7', '_blank')}
              className="w-full"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Completar Formulário
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dadosDisponiveis).map(([key, value]) => {
              if (!value || value === 'Não informado') return null;
              return (
                <div key={key} className="flex justify-between items-center py-2 border-b border-muted/30 last:border-0">
                  <span className="font-medium text-sm text-muted-foreground">{formatFieldName(key)}</span>
                  <span className="text-sm font-medium">{renderValue(value, key)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  const organizarDados = () => {
    const respostas = dados?.dados_completos || formulario?.respostas || {};
    
    const dadosBasicos = {
      nome: dados?.nome_cliente || respostas.nome,
      email: dados?.email_cliente || formulario?.email_usuario,
      telefone: dados?.telefone || respostas.telefone,
      tipo_negocio: dados?.tipo_negocio || respostas.tipo_negocio
    };

    const dadosNegocio = {
      produto_descricao: dados?.produto_descricao || respostas.produto_descricao,
      valor_medio_produto: dados?.valor_medio_produto || respostas.valor_medio_produto,
      ja_teve_vendas: dados?.ja_teve_vendas || respostas.ja_teve_vendas,
      investimento_diario: respostas.investimento_diario
    };

    const infraestrutura = {
      hasBM: respostas.hasBM,
      hasImageCreatives: respostas.hasImageCreatives,
      hasVideoCreatives: respostas.hasVideoCreatives,
      hasSalesPage: respostas.hasSalesPage,
      hasWhatsAppAutomation: respostas.hasWhatsAppAutomation
    };

    const visaoFuturo = {
      visao_futuro_texto: dados?.visao_futuro_texto || respostas.visao_futuro_texto,
      audio_visao_futuro: dados?.audio_visao_futuro || respostas.audio_visao_futuro
    };

    const statusProjeto = {
      status_negociacao: dados?.status_negociacao || formulario?.status_negociacao,
      vendedor_responsavel: dados?.vendedor_responsavel || formulario?.vendedor_responsavel,
      planejamento_estrategico: dados?.planejamento_estrategico
    };

    return { dadosBasicos, dadosNegocio, infraestrutura, visaoFuturo, statusProjeto };
  };

  const { dadosBasicos, dadosNegocio, infraestrutura, visaoFuturo, statusProjeto } = organizarDados();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return renderPerfilTab();
      case 'negocio':
        return renderNegocioTab();
      case 'orcamento':
        return renderOrcamentoTab();
      case 'planejamento':
        return renderPlanejamentoTab();
      case 'status':
        return renderStatusTab();
      default:
        return renderDashboardTab();
    }
  };

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Status e Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Formulário Completo</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {porcentagemCompletude}% Completo
            </Badge>
          </div>
          <Progress value={porcentagemCompletude} className="h-2" />
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Perfil</h3>
              <p className="text-xs text-muted-foreground">Dados pessoais completos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Negócio</h3>
              <p className="text-xs text-muted-foreground">
                {dadosNegocio.produto_descricao ? 'Configurado' : 'Pendente'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Orçamento</h3>
              <p className="text-xs text-muted-foreground">
                R$ {custosInfo.total.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPerfilTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dadosBasicos).map(([key, value]) => {
            if (!value) return null;
            return (
              <div key={key} className="flex justify-between items-center py-3 border-b border-muted/30 last:border-0">
                <span className="text-sm text-muted-foreground font-medium">{formatFieldName(key)}</span>
                <div className="text-right">{renderValue(value, key)}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );

  const renderNegocioTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            Informações do Negócio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dadosNegocio).map(([key, value]) => {
            if (value === null || value === undefined) return null;
            return (
              <div key={key} className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">{formatFieldName(key)}</span>
                <div className="pl-2">{renderValue(value, key)}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Visão de Futuro */}
      {(visaoFuturo.visao_futuro_texto || visaoFuturo.audio_visao_futuro) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Visão de Futuro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visaoFuturo.visao_futuro_texto && (
              <div>
                <span className="text-sm text-muted-foreground font-medium">Descrição</span>
                <div className="mt-1">{renderValue(visaoFuturo.visao_futuro_texto)}</div>
              </div>
            )}
            {visaoFuturo.audio_visao_futuro && (
              <div>
                <span className="text-sm text-muted-foreground font-medium">Áudio</span>
                <div className="mt-1">{renderValue(visaoFuturo.audio_visao_futuro, 'audio_visao_futuro')}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderOrcamentoTab = () => (
    <div className="space-y-6">
      {/* Orçamento Personalizado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-purple-600" />
            Orçamento Personalizado
            <Badge variant="outline" className="ml-auto text-lg font-bold">
              <DollarSign className="w-4 h-4 mr-1" />
              R$ {custosInfo.total.toLocaleString('pt-BR')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Grid de Infraestrutura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Criativos de Imagem */}
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Criativos de Imagem (3)</span>
              </div>
              <div className="flex items-center gap-2">
                {infraestrutura.hasImageCreatives ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">✓ Possui</Badge>
                    <Badge variant="outline" className="text-green-600">-R$ 50</Badge>
                  </>
                ) : (
                  <Badge variant="outline" className="text-red-600">+R$ 50</Badge>
                )}
              </div>
            </div>

            {/* Criativos de Vídeo */}
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-sm">Criativos de Vídeo (3)</span>
              </div>
              <div className="flex items-center gap-2">
                {infraestrutura.hasVideoCreatives ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">✓ Possui</Badge>
                    <Badge variant="outline" className="text-green-600">-R$ 100</Badge>
                  </>
                ) : (
                  <Badge variant="outline" className="text-red-600">+R$ 100</Badge>
                )}
              </div>
            </div>

            {/* Business Manager */}
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-sm">Business Manager</span>
              </div>
              <div className="flex items-center gap-2">
                {infraestrutura.hasBM ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">✓ Possui</Badge>
                    <Badge variant="outline" className="text-green-600">-R$ 200</Badge>
                  </>
                ) : (
                  <Badge variant="outline" className="text-red-600">+R$ 200</Badge>
                )}
              </div>
            </div>

            {/* Página de Vendas */}
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Página de Vendas</span>
              </div>
              <div className="flex items-center gap-2">
                {infraestrutura.hasSalesPage ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">✓ Possui</Badge>
                    <Badge variant="outline" className="text-green-600">-R$ 100</Badge>
                  </>
                ) : (
                  <Badge variant="outline" className="text-red-600">+R$ 100</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Funil de Mensagens - Destaque Especial */}
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
                <div>
                  <span className="font-semibold text-yellow-800">Funil de Mensagens Automáticas</span>
                  <p className="text-sm text-yellow-600">💎 Nosso produto mais vendido!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {infraestrutura.hasWhatsAppAutomation ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">✓ Possui</Badge>
                    <Badge variant="outline" className="text-green-600 font-bold">-R$ 700</Badge>
                  </>
                ) : (
                  <Badge variant="outline" className="text-red-600 font-bold text-lg">+R$ 700</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumo Financeiro */}
          <div className="space-y-3">
            {custosInfo.totalEconomias > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">💰 Economia Total (itens que você já possui)</span>
                <span className="font-bold text-green-600">-R$ {custosInfo.totalEconomias.toLocaleString('pt-BR')}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="font-bold text-blue-800 text-lg">Investimento Total Necessário</span>
              <span className="font-bold text-blue-600 text-xl">R$ {custosInfo.total.toLocaleString('pt-BR')}</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );

  const renderPlanejamentoTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Planejamento Estratégico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusProjeto.planejamento_estrategico ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: statusProjeto.planejamento_estrategico }} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Planejamento em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                Seu planejamento estratégico personalizado será gerado após a análise completa dos seus dados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStatusTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Status do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(statusProjeto).map(([key, value]) => {
            if (!value) return null;
            return (
              <div key={key} className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">{formatFieldName(key)}</span>
                <div className="pl-2">{renderValue(value, key)}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderTabContent()}
    </div>
  );
};
