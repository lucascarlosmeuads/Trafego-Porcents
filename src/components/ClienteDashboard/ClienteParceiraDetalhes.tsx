
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
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
  Activity,
  Package,
  Gamepad2
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
      case 'negocio':
        return renderNegocioTab();
      case 'orcamento':
        return renderOrcamentoTab();
      case 'planejamento':
        return renderPlanejamentoTab();
      case 'comissoes':
        return renderComissoesTab();
      case 'metricas':
        return renderMetricasTab();
      default:
        return renderNegocioTab();
    }
  };

  const renderComissoesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Controle de Comissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sistema de Comissões</h3>
            <p className="text-muted-foreground mb-4">
              Em breve você poderá registrar suas vendas e acompanhar suas comissões aqui.
            </p>
            <Button disabled>
              Registrar Venda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetricasTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Métricas da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Métricas em Desenvolvimento</h3>
            <p className="text-muted-foreground mb-4">
              Em breve você terá acesso completo às métricas da sua campanha.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Cliques</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Impressões</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">CTR</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );


  const renderNegocioTab = () => {
    if (!formulario?.respostas && !dados?.dados_completos) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma informação do negócio disponível.</p>
        </div>
      );
    }

    const respostas = dados?.dados_completos || formulario?.respostas || {};
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Meu Negócio</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(dadosBasicos).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium text-sm">{formatFieldName(key)}:</span>
                    <span className="text-sm text-muted-foreground">
                      {renderValue(value, key)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Informações do Negócio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações do Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(dadosNegocio).map(([key, value]) => {
                if (value === null || value === undefined) return null;
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium text-sm">{formatFieldName(key)}:</span>
                    <span className="text-sm text-muted-foreground">
                      {renderValue(value, key)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Infraestrutura Disponível */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Infraestrutura Disponível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(infraestrutura).map(([key, value]) => {
                if (value === null || value === undefined) return null;
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium text-sm">{formatFieldName(key)}:</span>
                    <span className="text-sm text-muted-foreground">
                      {renderValue(value, key)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Visão de Futuro */}
          {(visaoFuturo.visao_futuro_texto || visaoFuturo.audio_visao_futuro) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Visão de Futuro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {visaoFuturo.visao_futuro_texto && (
                  <div className="py-2 border-b border-border/50">
                    <span className="font-medium text-sm block mb-2">Descrição:</span>
                    <div className="text-sm text-muted-foreground">{renderValue(visaoFuturo.visao_futuro_texto)}</div>
                  </div>
                )}
                {visaoFuturo.audio_visao_futuro && (
                  <div className="py-2">
                    <span className="font-medium text-sm block mb-2">Áudio:</span>
                    <div>{renderValue(visaoFuturo.audio_visao_futuro, 'audio_visao_futuro')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderOrcamentoTab = () => {
    // Estado para controlar os itens selecionados
    const [selectedItems, setSelectedItems] = useState({
      criativos3img: false,
      criativos10img: false,
      criativos3video: false,
      site: false,
      funilGamificado: false
    });

    // Tabela de preços conforme especificado
    const precos = {
      criativos3img: 50,
      criativos10img: 100,
      criativos3video: 80,
      site: 200,
      funilGamificado: 800
    };

    // Calcular total
    const total = Object.entries(selectedItems)
      .filter(([_, selected]) => selected)
      .reduce((sum, [key, _]) => sum + precos[key as keyof typeof precos], 0);

    const handleItemChange = (item: keyof typeof selectedItems, checked: boolean) => {
      setSelectedItems(prev => ({
        ...prev,
        [item]: checked
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Orçamento do Funil</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monte seu Orçamento Personalizado</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                Total: R$ {total.toLocaleString('pt-BR')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Seção Criativos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Criativos
              </h3>
              
              <div className="grid gap-3">
                {/* 3 Criativos de Imagem */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedItems.criativos3img}
                      onCheckedChange={(checked) => handleItemChange('criativos3img', checked as boolean)}
                    />
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">3 Criativos de Imagem</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    R$ 50
                  </Badge>
                </div>

                {/* 10 Criativos de Imagem */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedItems.criativos10img}
                      onCheckedChange={(checked) => handleItemChange('criativos10img', checked as boolean)}
                    />
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">10 Criativos de Imagem</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    R$ 100
                  </Badge>
                </div>

                {/* 3 Criativos de Vídeo */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedItems.criativos3video}
                      onCheckedChange={(checked) => handleItemChange('criativos3video', checked as boolean)}
                    />
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">3 Criativos de Vídeo</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    R$ 80
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção Desenvolvimento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Desenvolvimento
              </h3>
              
              <div className="grid gap-3">
                {/* Site */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedItems.site}
                      onCheckedChange={(checked) => handleItemChange('site', checked as boolean)}
                    />
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Site Profissional</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    R$ 200
                  </Badge>
                </div>

                {/* Funil Gamificado */}
                <div className="flex items-center justify-between p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50/50 transition-colors bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedItems.funilGamificado}
                      onCheckedChange={(checked) => handleItemChange('funilGamificado', checked as boolean)}
                    />
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 text-yellow-600" />
                      <div>
                        <span className="font-medium text-yellow-800">Funil de Venda Gamificado</span>
                        <p className="text-xs text-yellow-600">🏆 Nosso produto premium!</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-bold text-yellow-700 border-yellow-300">
                    R$ 800
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Resumo do Orçamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resumo do Orçamento</h3>
              
              {Object.entries(selectedItems).filter(([_, selected]) => selected).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(selectedItems)
                    .filter(([_, selected]) => selected)
                    .map(([key, _]) => {
                      const labels = {
                        criativos3img: '3 Criativos de Imagem',
                        criativos10img: '10 Criativos de Imagem',
                        criativos3video: '3 Criativos de Vídeo',
                        site: 'Site Profissional',
                        funilGamificado: 'Funil de Venda Gamificado'
                      };
                      
                      return (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm">{labels[key as keyof typeof labels]}</span>
                          <span className="font-medium">R$ {precos[key as keyof typeof precos].toLocaleString('pt-BR')}</span>
                        </div>
                      );
                    })}
                  
                  <div className="flex justify-between items-center pt-3 border-t-2 border-primary/20">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-xl font-bold text-primary">R$ {total.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calculator className="h-8 w-8 mx-auto mb-2" />
                  <p>Selecione os itens acima para ver seu orçamento personalizado</p>
                </div>
              )}

              {total > 0 && (
                <Button className="w-full" size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Solicitar Orçamento (R$ {total.toLocaleString('pt-BR')})
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    );
  };

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
