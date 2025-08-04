import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  DollarSign, 
  Target, 
  Lightbulb, 
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Award,
  Briefcase,
  Heart,
  Edit3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calculator,
  CreditCard,
  ShoppingCart,
  MessageSquare,
  Monitor,
  Camera,
  Video,
  Eye,
  Minus
} from 'lucide-react';
import { FormularioParceiraData, ConsolidatedParceiraData } from '@/hooks/useClienteParceiraData';

interface ClienteParceiraDetalhesProps {
  formulario: FormularioParceiraData | null;
  dadosConsolidados?: ConsolidatedParceiraData | null;
}

export function ClienteParceiraDetalhes({ formulario, dadosConsolidados }: ClienteParceiraDetalhesProps) {
  // Usar dados consolidados se disponíveis, senão usar formulário original
  const dados = dadosConsolidados || null

  // Sistema de cálculo de custos baseado nas respostas
  const calcularCustos = () => {
    const respostas = dados?.dados_completos || formulario?.respostas || {};
    
    const custos = {
      bmCost: respostas.hasBM === false ? 500 : 0,
      checkoutCost: respostas.hasCheckout === false ? 800 : 0,
      creativeCost: (!respostas.hasImageCreatives && !respostas.hasVideoCreatives) ? 1200 : 0,
      whatsappCost: respostas.hasWhatsApp === false ? 300 : 0
    };
    
    const total = Object.values(custos).reduce((sum, cost) => sum + cost, 0);
    
    return {
      ...custos,
      total,
      hasDiscounts: respostas.hasBM || respostas.hasCheckout || respostas.hasImageCreatives || respostas.hasVideoCreatives || respostas.hasWhatsApp
    };
  };

  const custosInfo = calcularCustos();
  
  if (!dados && !formulario) {
    return (
      <Card className="border-muted-foreground/20">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p>Dados não encontrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Usar completude dos dados consolidados se disponível
  const porcentagemCompletude = dados?.porcentagem_completude || 0

  // Se formulário está muito incompleto, mostrar interface especial
  if (porcentagemCompletude < 80) {
    const dadosDisponiveis = {
      nome: dados?.nome_cliente || (formulario?.respostas?.nome) || 'Não informado',
      email: dados?.email_cliente || formulario?.email_usuario || 'Não informado',
      telefone: dados?.telefone || (formulario?.respostas?.telefone) || 'Não informado',
      tipo_negocio: dados?.tipo_negocio || formulario?.tipo_negocio || 'service',
    };

    return (
      <div className="space-y-6">
        {/* Aviso de Formulário Incompleto */}
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              Formulário Incompleto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso do formulário</span>
                  <span className="font-medium">{porcentagemCompletude}%</span>
                </div>
                <Progress value={porcentagemCompletude} className="h-2" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Você precisa completar as informações do seu formulário para ter acesso completo 
              ao painel e receber seu planejamento estratégico personalizado.
            </p>
            
            <Button 
              onClick={() => window.open('https://forms.gle/7bWM76eZV4JvnpHx7', '_blank')}
              className="w-full gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Completar Formulário Agora
            </Button>
          </CardContent>
        </Card>

        {/* Dados Disponíveis */}
        <Card className="border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Suas Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(dadosDisponiveis).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="flex justify-between items-center p-3 bg-muted/20 rounded">
                  <span className="font-medium text-sm">{formatFieldName(key)}:</span>
                  <span className="text-sm">{renderValue(value, key)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Target className="h-5 w-5" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium text-sm">Complete seu formulário</h4>
                <p className="text-xs text-muted-foreground">Preencha todas as informações necessárias sobre seu negócio</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium text-sm">Receba seu planejamento</h4>
                <p className="text-xs text-muted-foreground">Nossa IA criará um plano estratégico personalizado para você</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium text-sm">Comece a parceria</h4>
                <p className="text-xs text-muted-foreground">Tenha acesso completo ao sistema e inicie sua jornada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info de Criação */}
        <Card className="bg-muted/30 border-muted-foreground/20">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>Cadastro criado em: {format(new Date(dados?.created_at || formulario?.created_at || new Date()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Componente para renderizar valor com indicação de custo
  const renderValueWithCost = (value: any, fieldName: string): React.ReactNode => {
    const isInfraField = ['hasBM', 'hasCheckout', 'hasImageCreatives', 'hasVideoCreatives', 'hasWhatsApp'].includes(fieldName);
    
    if (!isInfraField) {
      return renderValue(value, fieldName);
    }

    const costInfo = {
      hasBM: { cost: 500, label: 'Business Manager' },
      hasCheckout: { cost: 800, label: 'Sistema de Checkout' },
      hasImageCreatives: { cost: 600, label: 'Criativos de Imagem' },
      hasVideoCreatives: { cost: 600, label: 'Criativos de Vídeo' },
      hasWhatsApp: { cost: 300, label: 'WhatsApp Business' }
    };

    const info = costInfo[fieldName as keyof typeof costInfo];
    const hasValue = value === true;
    const actualCost = hasValue ? 0 : info?.cost || 0;

    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge 
            variant={hasValue ? 'default' : 'secondary'} 
            className={`text-xs ${hasValue ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
          >
            {hasValue ? 'Sim' : 'Não'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {hasValue ? (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
              <TrendingDown className="w-3 h-3 mr-1" />
              Economia
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              + R$ {actualCost}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderValue = (value: any, fieldName?: string): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">Não informado</span>;
    
    // Tratamento especial para áudio
    if (fieldName === 'audio_visao_futuro' && typeof value === 'string' && value) {
      return (
        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 dark:text-blue-300 font-medium">Áudio da visão de futuro</span>
          <audio controls className="ml-auto">
            <source src={value} type="audio/mpeg" />
            <source src={value} type="audio/webm" />
            <source src={value} type="audio/wav" />
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge 
          variant={value ? 'default' : 'secondary'} 
          className={`text-xs font-medium ${
            value 
              ? 'bg-green-100 text-green-800 border-green-300' 
              : 'bg-gray-100 text-gray-700 border-gray-300'
          }`}
        >
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">Nenhum selecionado</span>;
      
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-background/80 text-foreground border-muted-foreground/30">
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
        return <span className="font-semibold text-green-700 dark:text-green-400">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>;
      }
      return <span className="font-medium text-foreground">{value.toLocaleString('pt-BR')}</span>;
    }
    
    if (typeof value === 'string') {
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
            <span className="text-foreground font-medium">{value}</span>
            {cleanNumber && (
              <a 
                href={`https://wa.me/55${cleanNumber}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-xs font-medium underline"
              >
                (Abrir WhatsApp)
              </a>
            )}
          </div>
        );
      }
    }
    
    return <span className="text-foreground">{String(value)}</span>;
  };

  const formatFieldName = (key: string): string => {
    const fieldNames: { [key: string]: string } = {
      nome: 'Nome Completo',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telefone: 'Telefone',
      tipo: 'Tipo de Negócio',
      tipo_negocio: 'Categoria do Negócio',
      produto_descricao: 'Descrição do Produto/Serviço',
      valor_medio_produto: 'Valor Médio do Produto',
      ja_teve_vendas: 'Já teve vendas anteriores?',
      visao_futuro_texto: 'Visão de Futuro (Texto)',
      audio_visao_futuro: 'Visão de Futuro (Áudio)',
      planejamento_estrategico: 'Planejamento Estratégico',
      cliente_pago: 'Cliente Pagou?',
      status_negociacao: 'Status da Negociação',
      vendedor_responsavel: 'Vendedor Responsável',
      completo: 'Formulário Completo?',
      comissao: 'Comissão Aceita (%)',
      investimento_diario: 'Investimento Diário',
      hasBM: 'Possui Business Manager?',
      hasCheckout: 'Possui Sistema de Checkout?',
      hasWhatsApp: 'Possui WhatsApp Business?',
      hasImageCreatives: 'Possui Criativos de Imagem?',
      hasVideoCreatives: 'Possui Criativos de Vídeo?',
      totalCost: 'Custo Total',
      breakdown: 'Detalhamento de Custos'
    };
    
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getSectionTheme = (sectionType: string) => {
    const themes = {
      dadosBasicos: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
        border: 'border-blue-200 dark:border-blue-700',
        header: 'bg-blue-100 dark:bg-blue-900/50',
        text: 'text-blue-800 dark:text-blue-200'
      },
      negocio: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
        border: 'border-green-200 dark:border-green-700',
        header: 'bg-green-100 dark:bg-green-900/50',
        text: 'text-green-800 dark:text-green-200'
      },
      infraestrutura: {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
        border: 'border-orange-200 dark:border-orange-700',
        header: 'bg-orange-100 dark:bg-orange-900/50',
        text: 'text-orange-800 dark:text-orange-200'
      },
      financeiro: {
        bg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
        border: 'border-purple-200 dark:border-purple-700',
        header: 'bg-purple-100 dark:bg-purple-900/50',
        text: 'text-purple-800 dark:text-purple-200'
      },
      visaoFuturo: {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30',
        border: 'border-pink-200 dark:border-pink-700',
        header: 'bg-pink-100 dark:bg-pink-900/50',
        text: 'text-pink-800 dark:text-pink-200'
      },
      status: {
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30',
        border: 'border-gray-200 dark:border-gray-700',
        header: 'bg-gray-100 dark:bg-gray-900/50',
        text: 'text-gray-800 dark:text-gray-200'
      }
    };
    
    return themes[sectionType as keyof typeof themes] || themes.status;
  };

  const renderSection = (title: string, data: any, icon: React.ReactNode, sectionType: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    const theme = getSectionTheme(sectionType);
    const isInfraSection = sectionType === 'infraestrutura';

    return (
      <Card className={`shadow-lg ${theme.border} ${theme.bg} hover:shadow-xl transition-all duration-300`}>
        <CardHeader className={`pb-4 ${theme.header} ${theme.border} border-b`}>
          <CardTitle className={`flex items-center gap-3 text-lg font-bold ${theme.text}`}>
            {icon}
            {title}
            {isInfraSection && (
              <Badge variant="outline" className={`ml-auto text-xs ${theme.text} bg-white/50`}>
                <Calculator className="w-3 h-3 mr-1" />
                Custos Incluídos
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className={`p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-white/50 dark:border-gray-700/50 ${index !== Object.entries(data).length - 1 ? 'mb-3' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 min-w-0 flex-1">
                  {formatFieldName(key)}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 flex-shrink-0">
                  {isInfraSection ? renderValueWithCost(value, key) : renderValue(value, key)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Organizar dados consolidados em seções estratégicas
  const organizarDadosEstrategicos = () => {
    const respostas = dados?.dados_completos || formulario?.respostas || {};
    
    // Dados básicos
    const dadosBasicos = {
      nome: dados?.nome_cliente || respostas.nome || 'Não informado',
      email: dados?.email_cliente || formulario?.email_usuario,
      whatsapp: respostas.whatsapp,
      telefone: dados?.telefone || respostas.telefone,
    };

    // Informações do negócio
    const negocio = {
      tipo_negocio: dados?.tipo_negocio || formulario?.tipo_negocio,
      produto_descricao: dados?.produto_descricao || formulario?.produto_descricao,
      valor_medio_produto: dados?.valor_medio_produto || formulario?.valor_medio_produto,
      ja_teve_vendas: dados?.ja_teve_vendas || formulario?.ja_teve_vendas,
      comissao: respostas.comissao,
      investimento_diario: respostas.investimentoDiario || respostas.investimento_diario,
    };

    // Infraestrutura
    const infraestrutura = {
      hasBM: respostas.hasBM,
      hasCheckout: respostas.hasCheckout,
      hasWhatsApp: respostas.hasWhatsApp,
      hasImageCreatives: respostas.hasImageCreatives,
      hasVideoCreatives: respostas.hasVideoCreatives,
    };

    // Situação financeira
    const financeiro = {
      totalCost: respostas.totalCost,
      breakdown: respostas.breakdown,
    };

    // Visão de futuro
    const visaoFuturo = {
      visao_futuro_texto: dados?.visao_futuro_texto || formulario?.visao_futuro_texto,
      audio_visao_futuro: dados?.audio_visao_futuro || formulario?.audio_visao_futuro,
    };

    // Status e controle
    const status = {
      completo: dados?.completo || formulario?.completo,
      cliente_pago: dados?.cliente_pago || formulario?.cliente_pago,
      status_negociacao: dados?.status_negociacao || formulario?.status_negociacao,
      vendedor_responsavel: dados?.vendedor_responsavel || formulario?.vendedor_responsavel,
    };

    return {
      dadosBasicos: Object.fromEntries(Object.entries(dadosBasicos).filter(([_, v]) => v !== null && v !== undefined)),
      negocio: Object.fromEntries(Object.entries(negocio).filter(([_, v]) => v !== null && v !== undefined)),
      infraestrutura: Object.fromEntries(Object.entries(infraestrutura).filter(([_, v]) => v !== null && v !== undefined)),
      financeiro: Object.fromEntries(Object.entries(financeiro).filter(([_, v]) => v !== null && v !== undefined)),
      visaoFuturo: Object.fromEntries(Object.entries(visaoFuturo).filter(([_, v]) => v !== null && v !== undefined)),
      status: Object.fromEntries(Object.entries(status).filter(([_, v]) => v !== null && v !== undefined)),
    };
  };

  const secoesDados = organizarDadosEstrategicos();

  return (
    <div className="space-y-8">
      {/* Cabeçalho Melhorado com Progresso e Resumo Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo Estratégico */}
        <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Award className="h-7 w-7" />
              Perfil de Parceria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 opacity-80" />
                  <span className="text-sm font-medium opacity-90">Tipo</span>
                </div>
                <span className="font-bold">{dados?.tipo_negocio || formulario?.tipo_negocio || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 opacity-80" />
                  <span className="text-sm font-medium opacity-90">Valor Médio</span>
                </div>
                <span className="font-bold">
                  {(dados?.valor_medio_produto || formulario?.valor_medio_produto) 
                    ? `R$ ${(dados?.valor_medio_produto || formulario?.valor_medio_produto)?.toLocaleString('pt-BR')}` 
                    : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 opacity-80" />
                  <span className="text-sm font-medium opacity-90">Status</span>
                </div>
                <Badge variant={(dados?.cliente_pago || formulario?.cliente_pago) ? 'default' : 'secondary'} 
                       className={`font-bold ${(dados?.cliente_pago || formulario?.cliente_pago) 
                         ? 'bg-green-500 text-white' 
                         : 'bg-orange-500 text-white'}`}>
                  {(dados?.cliente_pago || formulario?.cliente_pago) ? 'PAGO' : 'PENDENTE'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro com Breakdown de Custos */}
        <Card className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Calculator className="h-7 w-7" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">
                R$ {custosInfo.total.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm opacity-90">
                {custosInfo.total > 0 ? 'Custos Adicionais' : 'Nenhum Custo Extra'}
              </div>
            </div>
            
            {custosInfo.total > 0 && (
              <div className="space-y-2">
                {custosInfo.bmCost > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-90">Business Manager</span>
                    <span className="font-medium">+ R$ {custosInfo.bmCost}</span>
                  </div>
                )}
                {custosInfo.checkoutCost > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-90">Sistema Checkout</span>
                    <span className="font-medium">+ R$ {custosInfo.checkoutCost}</span>
                  </div>
                )}
                {custosInfo.creativeCost > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-90">Criativos</span>
                    <span className="font-medium">+ R$ {custosInfo.creativeCost}</span>
                  </div>
                )}
                {custosInfo.whatsappCost > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-90">WhatsApp Business</span>
                    <span className="font-medium">+ R$ {custosInfo.whatsappCost}</span>
                  </div>
                )}
              </div>
            )}
            
            {custosInfo.hasDiscounts && (
              <div className="flex items-center gap-2 text-xs bg-white/10 p-2 rounded">
                <CheckCircle className="h-4 w-4" />
                <span>Você tem itens que geram economia!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planejamento Estratégico (se disponível) */}
      {(dados?.planejamento_estrategico || formulario?.planejamento_estrategico) && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 border-b border-yellow-200 dark:border-yellow-700">
            <CardTitle className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200 text-xl font-bold">
              <Lightbulb className="h-6 w-6" />
              Seu Planejamento Estratégico Personalizado
              <Badge variant="outline" className="ml-auto bg-yellow-200 text-yellow-800 border-yellow-300">
                <Eye className="w-3 h-3 mr-1" />
                IA Generated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert bg-white/60 dark:bg-black/20 p-6 rounded-lg">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {dados?.planejamento_estrategico || formulario?.planejamento_estrategico}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhes Estruturados por Seções */}
      <div className="space-y-6">
        {secoesDados.dadosBasicos && Object.keys(secoesDados.dadosBasicos).length > 0 && 
          renderSection("Dados Pessoais", secoesDados.dadosBasicos, <User className="h-6 w-6" />, "dadosBasicos")}
        
        {secoesDados.negocio && Object.keys(secoesDados.negocio).length > 0 && 
          renderSection("Informações do Negócio", secoesDados.negocio, <Briefcase className="h-6 w-6" />, "negocio")}
        
        {secoesDados.infraestrutura && Object.keys(secoesDados.infraestrutura).length > 0 && 
          renderSection("Infraestrutura & Ferramentas", secoesDados.infraestrutura, <Settings className="h-6 w-6" />, "infraestrutura")}
        
        {secoesDados.financeiro && Object.keys(secoesDados.financeiro).length > 0 && 
          renderSection("Situação Financeira", secoesDados.financeiro, <DollarSign className="h-6 w-6" />, "financeiro")}
        
        {secoesDados.visaoFuturo && Object.keys(secoesDados.visaoFuturo).length > 0 && 
          renderSection("Visão de Futuro", secoesDados.visaoFuturo, <Heart className="h-6 w-6" />, "visaoFuturo")}
        
        {secoesDados.status && Object.keys(secoesDados.status).length > 0 && 
          renderSection("Status e Controle", secoesDados.status, <FileText className="h-6 w-6" />, "status")}
      </div>

      {/* Informações de Preenchimento */}
      <Card className="bg-muted/30 border-muted-foreground/20">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Formulário preenchido em: {format(new Date(dados?.created_at || formulario?.created_at || new Date()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            {(dados?.updated_at || formulario?.updated_at) !== (dados?.created_at || formulario?.created_at) && (
              <p>Última atualização: {format(new Date(dados?.updated_at || formulario?.updated_at || new Date()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}