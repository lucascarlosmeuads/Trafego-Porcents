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
  AlertTriangle
} from 'lucide-react';
import { FormularioParceiraData } from '@/hooks/useClienteParceiraData';

interface ClienteParceiraDetalhesProps {
  formulario: FormularioParceiraData | null;
}

export function ClienteParceiraDetalhes({ formulario }: ClienteParceiraDetalhesProps) {
  if (!formulario) {
    return (
      <Card className="border-muted-foreground/20">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p>Dados do formulário não encontrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Função para calcular completude do formulário
  const calcularCompletude = () => {
    const respostas = formulario.respostas || {};
    const camposEsperados = [
      'nome', 'whatsapp', 'telefone', 'comissao', 'investimentoDiario',
      'hasBM', 'hasCheckout', 'hasWhatsApp', 'hasImageCreatives', 
      'hasVideoCreatives', 'totalCost'
    ];
    
    const camposPreenchidos = camposEsperados.filter(campo => {
      const valor = respostas[campo];
      return valor !== null && valor !== undefined && valor !== '';
    });

    const porcentagem = Math.round((camposPreenchidos.length / camposEsperados.length) * 100);
    
    return {
      porcentagem,
      camposPreenchidos: camposPreenchidos.length,
      totalCampos: camposEsperados.length,
      incompleto: porcentagem < 80
    };
  };

  const completude = calcularCompletude();

  // Se formulário está muito incompleto, mostrar interface especial
  if (completude.incompleto) {
    const respostas = formulario.respostas || {};
    const dadosDisponiveis = {
      nome: respostas.nome || 'Não informado',
      email: formulario.email_usuario,
      telefone: respostas.telefone,
      tipo_negocio: formulario.tipo_negocio || 'service',
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
                  <span className="font-medium">{completude.porcentagem}%</span>
                </div>
                <Progress value={completude.porcentagem} className="h-2" />
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
              <p>Cadastro criado em: {format(new Date(formulario.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderValue = (value: any, fieldName?: string): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">Não informado</span>;
    
    // Tratamento especial para áudio
    if (fieldName === 'audio_visao_futuro' && typeof value === 'string' && value) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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

  const renderSection = (title: string, data: any, icon: React.ReactNode) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <Card className="shadow-sm border-muted-foreground/20">
        <CardHeader className="pb-3 bg-muted/50 border-b border-muted-foreground/20">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-b border-muted-foreground/20 pb-3 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-muted/20 p-3 rounded">
                <div className="font-semibold text-sm text-foreground md:col-span-1">
                  {formatFieldName(key)}:
                </div>
                <div className="md:col-span-3 text-sm text-foreground">
                  {renderValue(value, key)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const respostas = formulario.respostas || {};
  
  // Organizar dados em seções estratégicas
  const organizarDadosEstrategicos = () => {
    // Dados básicos diretamente do formulário
    const dadosBasicos = {
      nome: respostas.nome || 'Não informado',
      email: formulario.email_usuario,
      whatsapp: respostas.whatsapp,
      telefone: respostas.telefone,
    };

    // Informações do negócio
    const negocio = {
      tipo_negocio: formulario.tipo_negocio,
      produto_descricao: formulario.produto_descricao,
      valor_medio_produto: formulario.valor_medio_produto,
      ja_teve_vendas: formulario.ja_teve_vendas,
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
      visao_futuro_texto: formulario.visao_futuro_texto,
      audio_visao_futuro: formulario.audio_visao_futuro,
    };

    // Status e controle
    const status = {
      completo: formulario.completo,
      cliente_pago: formulario.cliente_pago,
      status_negociacao: formulario.status_negociacao,
      vendedor_responsavel: formulario.vendedor_responsavel,
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

  const dados = organizarDadosEstrategicos();

  return (
    <div className="space-y-6">
      {/* Resumo Estratégico */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Award className="h-6 w-6 text-primary" />
            Resumo do Seu Perfil de Parceria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formulario.tipo_negocio}</div>
              <div className="text-sm text-muted-foreground">Tipo de Negócio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formulario.valor_medio_produto ? `R$ ${formulario.valor_medio_produto.toLocaleString('pt-BR')}` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Valor Médio do Produto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                <Badge variant={formulario.cliente_pago ? 'default' : 'secondary'}>
                  {formulario.cliente_pago ? 'PAGO' : 'PENDENTE'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">Status do Pagamento</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planejamento Estratégico (se disponível) */}
      {formulario.planejamento_estrategico && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Lightbulb className="h-5 w-5" />
              Seu Planejamento Estratégico Personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {formulario.planejamento_estrategico}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seções Detalhadas */}
      <Accordion type="multiple" defaultValue={["dados", "negocio", "visao"]} className="space-y-4">
        {dados.dadosBasicos && Object.keys(dados.dadosBasicos).length > 0 && (
          <AccordionItem value="dados" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                📋 Seus Dados Pessoais
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderSection('', dados.dadosBasicos, null)}
            </AccordionContent>
          </AccordionItem>
        )}

        {dados.negocio && Object.keys(dados.negocio).length > 0 && (
          <AccordionItem value="negocio" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                🏢 Informações do Seu Negócio
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderSection('', dados.negocio, null)}
            </AccordionContent>
          </AccordionItem>
        )}

        {dados.infraestrutura && Object.keys(dados.infraestrutura).length > 0 && (
          <AccordionItem value="infraestrutura" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                ⚙️ Sua Infraestrutura Atual
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderSection('', dados.infraestrutura, null)}
            </AccordionContent>
          </AccordionItem>
        )}

        {dados.financeiro && Object.keys(dados.financeiro).length > 0 && (
          <AccordionItem value="financeiro" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                💰 Situação Financeira
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderSection('', dados.financeiro, null)}
            </AccordionContent>
          </AccordionItem>
        )}

        {dados.visaoFuturo && Object.keys(dados.visaoFuturo).length > 0 && (
          <AccordionItem value="visao" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                🚀 Sua Visão de Futuro
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderSection('', dados.visaoFuturo, null)}
            </AccordionContent>
          </AccordionItem>
        )}

        {dados.status && Object.keys(dados.status).length > 0 && (
          <AccordionItem value="status" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                📊 Status e Controle
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderSection('', dados.status, null)}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Informações de Preenchimento */}
      <Card className="bg-muted/30 border-muted-foreground/20">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Formulário preenchido em: {format(new Date(formulario.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            {formulario.updated_at !== formulario.created_at && (
              <p>Última atualização: {format(new Date(formulario.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}