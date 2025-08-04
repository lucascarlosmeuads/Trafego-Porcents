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
  Star
} from 'lucide-react';
import { FormularioParceiraData, ConsolidatedParceiraData } from '@/hooks/useClienteParceiraData';

interface ClienteParceiraDetalhesProps {
  formulario: FormularioParceiraData | null;
  dadosConsolidados?: ConsolidatedParceiraData | null;
}

export function ClienteParceiraDetalhes({ formulario, dadosConsolidados }: ClienteParceiraDetalhesProps) {
  const dados = dadosConsolidados || null;

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

  const formatFieldName = (key: string): string => {
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
      hasImageCreatives: 'Criativos de Imagem',
      hasVideoCreatives: 'Criativos de Vídeo'
    };
    
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

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
      hasCheckout: respostas.hasCheckout,
      hasWhatsApp: respostas.hasWhatsApp,
      hasImageCreatives: respostas.hasImageCreatives,
      hasVideoCreatives: respostas.hasVideoCreatives
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Perfil de Parceria</h1>
        <p className="text-muted-foreground">Suas informações e progresso na parceria de tráfego</p>
      </div>

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

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dados Básicos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Dados Básicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dadosBasicos).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="flex justify-between items-center py-2 border-b border-muted/30 last:border-0">
                  <span className="text-sm text-muted-foreground font-medium">{formatFieldName(key)}</span>
                  <div className="text-right">{renderValue(value, key)}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Dados do Negócio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-green-600" />
              Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dadosNegocio).map(([key, value]) => {
              if (value === null || value === undefined) return null;
              return (
                <div key={key} className="space-y-1">
                  <span className="text-sm text-muted-foreground font-medium">{formatFieldName(key)}</span>
                  <div>{renderValue(value, key)}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Infraestrutura */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5 text-purple-600" />
              Infraestrutura
              <Badge variant="outline" className="ml-auto text-xs">
                <Calculator className="w-3 h-3 mr-1" />
                R$ {custosInfo.total}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(infraestrutura).map(([key, value]) => {
              if (value === null || value === undefined) return null;
              
              const custoMap: { [k: string]: number } = {
                hasBM: 500,
                hasCheckout: 800,
                hasImageCreatives: 600,
                hasVideoCreatives: 600,
                hasWhatsApp: 300
              };
              
              const custo = value ? 0 : custoMap[key] || 0;
              
              return (
                <div key={key} className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground font-medium">{formatFieldName(key)}</span>
                  <div className="flex items-center gap-2">
                    {renderValue(value, key)}
                    {custo > 0 && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        +R$ {custo}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Status do Projeto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-orange-600" />
              Status do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusProjeto).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="space-y-1">
                  <span className="text-sm text-muted-foreground font-medium">{formatFieldName(key)}</span>
                  <div>{renderValue(value, key)}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Visão de Futuro */}
      {(visaoFuturo.visao_futuro_texto || visaoFuturo.audio_visao_futuro) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Visão de Futuro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visaoFuturo.visao_futuro_texto && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">Descrição</span>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm leading-relaxed">{visaoFuturo.visao_futuro_texto}</p>
                </div>
              </div>
            )}
            {visaoFuturo.audio_visao_futuro && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">Áudio</span>
                {renderValue(visaoFuturo.audio_visao_futuro, 'audio_visao_futuro')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Criado em: {format(new Date(dados?.created_at || formulario?.created_at || new Date()), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            {dados?.updated_at && dados.updated_at !== dados.created_at && (
              <div className="flex items-center gap-1">
                <Edit3 className="h-4 w-4" />
                <span>Atualizado em: {format(new Date(dados.updated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}