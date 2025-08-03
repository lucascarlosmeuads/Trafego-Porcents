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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  AlertCircle,
  MapPin,
  Clock,
  Award,
  Briefcase,
  Heart
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
    
    // Tratamento especial para áudio
    if (fieldName === 'audio_visao_futuro' && typeof value === 'string' && value) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 dark:text-blue-300 font-medium">Áudio da visão de futuro disponível</span>
          <audio controls className="ml-auto">
            <source src={value} type="audio/mpeg" />
            <source src={value} type="audio/webm" />
            <source src={value} type="audio/wav" />
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      );
    }
    
    // Tratamento especial para audioUrl
    if (fieldName === 'audioUrl' && typeof value === 'string' && value) {
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
    
    // Tratamento especial para casos conhecidos
    if (fieldName === 'etapaAtual' && typeof value === 'string') {
      const etapaMap: Record<string, string> = {
        'commission': 'Comissão',
        'planning': 'Planejamento',
        'approval': 'Aprovação',
        'setup': 'Configuração',
        'launch': 'Lançamento',
        'infrastructure-check': 'Verificação de Infraestrutura',
        'whatsapp': 'Configuração WhatsApp',
        'business-manager': 'Business Manager',
        'checkout': 'Checkout',
        'creatives': 'Criativos',
        'targeting': 'Segmentação',
        'campaign-setup': 'Configuração de Campanha'
      };
      return <Badge variant="outline" className="text-xs font-medium border-primary/20 bg-primary/10 text-primary">{etapaMap[value] || value}</Badge>;
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
      
      // Verificar se é um array de caracteres (como strings separadas) - FIX do bug de letras estranhas
      if (value.every(item => typeof item === 'string' && item.length === 1)) {
        return <span className="text-foreground font-medium">{value.join('')}</span>;
      }
      
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
        <div className="bg-muted/50 border border-muted-foreground/20 p-3 rounded-lg text-sm space-y-2">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-foreground">{formatFieldName(key)}:</span>
              <span className="col-span-2 text-foreground">{renderValue(val, key)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

      // Mapeamento completo de todas as perguntas do formulário
  const FORMULARIO_PERGUNTAS = {
    dadosPersonais: {
      titulo: '📋 Dados Pessoais',
      perguntas: {
        nome: 'Qual é o seu nome completo?',
        email: 'Qual é o seu email?',
        whatsapp: 'Qual é o seu WhatsApp?',
        telefone: 'Qual é o seu telefone alternativo?',
        idade: 'Qual é a sua idade?',
        cidade: 'Em qual cidade você mora?',
        estado: 'Em qual estado você mora?',
      }
    },
    experiencia: {
      titulo: '🎓 Formação e Experiência',
      perguntas: {
        nivelEscolaridade: 'Qual é o seu nível de escolaridade?',
        experienciaEmpreendedorismo: 'Você tem experiência em empreendedorismo?',
        conhecimentoMarketing: 'Qual é o seu nível de conhecimento em marketing digital?',
        experienciaTrafegoAgo: 'Você já trabalhou com tráfego pago?',
        ferramentasConhecidas: 'Quais ferramentas de marketing você conhece?',
      }
    },
    negocio: {
      titulo: '🏢 Informações do Negócio',
      perguntas: {
        tipo: 'Qual tipo de negócio você pretende trabalhar?',
        tipoNegocio: 'Especifique o tipo de negócio',
        setorAtuacao: 'Em qual setor você atua ou pretende atuar?',
        publicoAlvo: 'Quem é o seu público-alvo?',
        principaisServicos: 'Quais são os principais serviços que você oferece?',
        diferencialCompetitivo: 'Qual é o seu diferencial competitivo?',
        storeType: 'Que tipo de loja você possui?',
        principaisObjetivos: 'Quais são os seus principais objetivos?',
        maioresDesafios: 'Quais são os seus maiores desafios?',
        advertisingProducts: 'Quais produtos você pretende anunciar?',
        produto_descricao: 'Descreva seu produto/serviço em detalhes',
        valor_medio_produto: 'Qual o valor médio do seu produto/serviço?',
        ja_teve_vendas: 'Você já teve vendas anteriores?',
      }
    },
    visaoFuturo: {
      titulo: '🚀 Visão de Futuro',
      perguntas: {
        visao_futuro_texto: 'Descreva sua visão de futuro (texto)',
        audio_visao_futuro: 'Gravação de áudio da visão de futuro',
        audioUrl: 'URL do áudio da visão de futuro',
        texto: 'Texto da visão de futuro',
      }
    },
    financeiro: {
      titulo: '💰 Situação Financeira',
      perguntas: {
        rendaMensal: 'Qual é a sua renda mensal atual?',
        valorInvestimento: 'Quanto você tem disponível para investir?',
        investimentoDiario: 'Qual valor você pretende investir diariamente?',
        tempoRetorno: 'Em quanto tempo você espera ver retorno?',
        metaFaturamento: 'Qual é a sua meta de faturamento?',
        comissao: 'Qual percentual de comissão você está disposto a pagar?',
        totalCost: 'Qual é o custo total estimado?',
        breakdown: 'Como será dividido este investimento?',
      }
    },
    infraestrutura: {
      titulo: '⚙️ Infraestrutura Atual',
      perguntas: {
        hasBM: 'Você possui Business Manager configurado?',
        hasCheckout: 'Você possui sistema de checkout?',
        hasWhatsApp: 'Você possui WhatsApp Business?',
        hasImageCreatives: 'Você possui criativos de imagem prontos?',
        hasVideoCreatives: 'Você possui criativos de vídeo prontos?',
        etapaAtual: 'Em qual etapa do processo você está?',
      }
    },
    status: {
      titulo: '📊 Status e Controle',
      perguntas: {
        completedAt: 'Quando foi concluído o preenchimento?',
        completo: 'O formulário foi totalmente preenchido?',
        planejamento_estrategico: 'Planejamento estratégico gerado',
      }
    }
  };

  const formatFieldName = (key: string): string => {
    // Buscar a pergunta correspondente em todas as seções
    for (const secao of Object.values(FORMULARIO_PERGUNTAS)) {
      if (secao.perguntas[key as keyof typeof secao.perguntas]) {
        return secao.perguntas[key as keyof typeof secao.perguntas];
      }
    }
    
    // Fallback para campos não mapeados
    const fieldNames: { [key: string]: string } = {
      tipo: 'Tipo',
      total: 'Total',
      breakdown: 'Detalhamento',
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
        <Card className="shadow-sm border-muted-foreground/20">
          <CardHeader className="pb-3 bg-muted/50 border-b border-muted-foreground/20">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
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
      <Card className="shadow-sm border-muted-foreground/20">
        <CardHeader className="pb-3 bg-muted/50 border-b border-muted-foreground/20">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
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
                <div key={key} className="border-b border-muted-foreground/20 pb-3 last:border-b-0 last:pb-0">
                  <h4 className="font-semibold mb-2 text-foreground">{sectionTitle}</h4>
                  <div className="pl-4">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 bg-muted/30 p-2 rounded">
                        <div className="font-semibold text-sm text-foreground md:col-span-1">
                          {formatFieldName(subKey)}:
                        </div>
                        <div className="md:col-span-3 text-sm text-foreground">
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
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const respostas = lead.respostas || {};

  // Organizar dados em seções estratégicas
  const organizarDadosEstrategicos = () => {
    // Verificar se dados estão aninhados (buscar em respostas.dadosPersonais, etc)
    const dadosPersonaisObj = respostas.dadosPersonais || respostas;
    const financeieroObj = respostas.financeiro || respostas;
    const infraestruturaObj = respostas.infraestrutura || respostas;
    const negocioObj = respostas.negocio || respostas;
    const experienciaObj = respostas.experiencia || respostas;
    
    // Extrair dados pessoais
    const dadosPersonais = {
      nome: dadosPersonaisObj.nome || respostas.nome,
      email: dadosPersonaisObj.email || respostas.email,
      whatsapp: dadosPersonaisObj.whatsapp || respostas.whatsapp,
      telefone: dadosPersonaisObj.telefone || respostas.telefone,
      idade: dadosPersonaisObj.idade || respostas.idade,
      cidade: dadosPersonaisObj.cidade || respostas.cidade,
      estado: dadosPersonaisObj.estado || respostas.estado
    };

    // Extrair informações financeiras
    const financeiro = {
      rendaMensal: financeieroObj.rendaMensal || respostas.rendaMensal,
      valorInvestimento: financeieroObj.valorInvestimento || respostas.valorInvestimento,
      investimentoDiario: financeieroObj.investimentoDiario || respostas.investimentoDiario,
      tempoRetorno: financeieroObj.tempoRetorno || respostas.tempoRetorno,
      metaFaturamento: financeieroObj.metaFaturamento || respostas.metaFaturamento,
      comissao: financeieroObj.comissao || respostas.comissao,
      totalCost: financeieroObj.totalCost || respostas.totalCost,
      breakdown: financeieroObj.breakdown || respostas.breakdown
    };

    // Extrair infraestrutura atual
    const infraestrutura = {
      hasBM: infraestruturaObj.hasBM || respostas.hasBM,
      hasCheckout: infraestruturaObj.hasCheckout || respostas.hasCheckout,
      hasWhatsApp: infraestruturaObj.hasWhatsApp || respostas.hasWhatsApp,
      hasImageCreatives: infraestruturaObj.hasImageCreatives || respostas.hasImageCreatives,
      hasVideoCreatives: infraestruturaObj.hasVideoCreatives || respostas.hasVideoCreatives,
      advertisingProducts: infraestruturaObj.advertisingProducts || respostas.advertisingProducts,
      etapaAtual: infraestruturaObj.etapaAtual || respostas.etapaAtual
    };

    // Extrair informações do negócio
    const negocio = {
      tipoNegocio: negocioObj.tipoNegocio || respostas.tipoNegocio,
      setorAtuacao: negocioObj.setorAtuacao || respostas.setorAtuacao,
      publicoAlvo: negocioObj.publicoAlvo || respostas.publicoAlvo,
      principaisServicos: negocioObj.principaisServicos || respostas.principaisServicos,
      diferencialCompetitivo: negocioObj.diferencialCompetitivo || respostas.diferencialCompetitivo,
      storeType: negocioObj.storeType || respostas.storeType,
      principaisObjetivos: negocioObj.principaisObjetivos || respostas.principaisObjetivos,
      maioresDesafios: negocioObj.maioresDesafios || respostas.maioresDesafios,
      produto_descricao: lead.produto_descricao || negocioObj.produto_descricao || respostas.produto_descricao,
      valor_medio_produto: lead.valor_medio_produto || negocioObj.valor_medio_produto || respostas.valor_medio_produto,
      ja_teve_vendas: lead.ja_teve_vendas || negocioObj.ja_teve_vendas || respostas.ja_teve_vendas
    };

    // Extrair visão de futuro (incluindo áudio e texto)
    const visaoFuturoObj = respostas.visaoFuturo || respostas;
    const visaoFuturo = {
      visao_futuro_texto: lead.visao_futuro_texto || visaoFuturoObj.texto || respostas.visao_futuro_texto,
      audio_visao_futuro: lead.audio_visao_futuro || visaoFuturoObj.audioUrl || respostas.audio_visao_futuro,
      audioUrl: visaoFuturoObj.audioUrl,
      texto: visaoFuturoObj.texto
    };

    // Extrair experiência e conhecimentos
    const experiencia = {
      nivelEscolaridade: experienciaObj.nivelEscolaridade || respostas.nivelEscolaridade,
      experienciaEmpreendedorismo: experienciaObj.experienciaEmpreendedorismo || respostas.experienciaEmpreendedorismo,
      conhecimentoMarketing: experienciaObj.conhecimentoMarketing || respostas.conhecimentoMarketing,
      experienciaTrafegoAgo: experienciaObj.experienciaTrafegoAgo || respostas.experienciaTrafegoAgo,
      ferramentasConhecidas: experienciaObj.ferramentasConhecidas || respostas.ferramentasConhecidas
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
      // Filtrar outras informações não categorizadas
      outras: Object.fromEntries(
        Object.entries(respostas).filter(([key]) => 
          !['nome', 'email', 'whatsapp', 'telefone', 'idade', 'cidade', 'estado',
            'rendaMensal', 'valorInvestimento', 'investimentoDiario', 'tempoRetorno', 
            'metaFaturamento', 'comissao', 'totalCost', 'breakdown',
            'hasBM', 'hasCheckout', 'hasWhatsApp', 'hasImageCreatives', 'hasVideoCreatives', 'advertisingProducts', 'etapaAtual',
            'tipoNegocio', 'setorAtuacao', 'publicoAlvo', 'principaisServicos', 'diferencialCompetitivo', 
            'storeType', 'principaisObjetivos', 'maioresDesafios',
            'nivelEscolaridade', 'experienciaEmpreendedorismo', 'conhecimentoMarketing', 
            'experienciaTrafegoAgo', 'ferramentasConhecidas',
            'dadosPersonais', 'financeiro', 'infraestrutura', 'negocio', 'experiencia' // Excluir seções aninhadas
          ].includes(key)
        )
      )
    };
  };

  const dadosOrganizados = organizarDadosEstrategicos();

  // Função para renderizar seção com pergunta e resposta
  const renderQuestionAnswer = (pergunta: string, valor: any, fieldName: string) => {
    return (
      <div className="py-3 border-b border-border/50 last:border-b-0">
        <div className="font-medium text-sm text-foreground mb-2">
          {pergunta}
        </div>
        <div className="pl-4 text-sm">
          {renderValue(valor, fieldName)}
        </div>
      </div>
    );
  };

  // Função para renderizar cada seção do accordion
  const renderFormSection = (sectionKey: string, sectionData: any) => {
    const section = FORMULARIO_PERGUNTAS[sectionKey as keyof typeof FORMULARIO_PERGUNTAS];
    if (!section) return null;

    // Buscar dados na estrutura aninhada ou direta
    const sectionObj = respostas[sectionKey] || respostas;
    
    // Coletar todas as perguntas desta seção que têm respostas
    const perguntasComResposta = Object.entries(section.perguntas).filter(([fieldKey]) => {
      let valor = sectionObj[fieldKey] || respostas[fieldKey];
      
      // Para seção visaoFuturo, pegar dados diretamente do lead se disponível
      if (sectionKey === 'visaoFuturo') {
        if (fieldKey === 'visao_futuro_texto') valor = lead.visao_futuro_texto || valor;
        if (fieldKey === 'audio_visao_futuro') valor = lead.audio_visao_futuro || valor;
      }
      
      // Para seção negocio, pegar novos campos do lead
      if (sectionKey === 'negocio') {
        if (fieldKey === 'produto_descricao') valor = lead.produto_descricao || valor;
        if (fieldKey === 'valor_medio_produto') valor = lead.valor_medio_produto || valor;
        if (fieldKey === 'ja_teve_vendas') valor = lead.ja_teve_vendas || valor;
      }
      
      // Para seção status, pegar planejamento estratégico do lead
      if (sectionKey === 'status' && fieldKey === 'planejamento_estrategico') {
        valor = lead.planejamento_estrategico || valor;
      }
      
      return valor !== undefined && valor !== null && valor !== '' && 
             !(Array.isArray(valor) && valor.length === 0);
    });

    if (perguntasComResposta.length === 0) return null;

    // Mapear ícones para cada seção
    const sectionIcons = {
      dadosPersonais: <User className="h-4 w-4" />,
      experiencia: <Award className="h-4 w-4" />,
      negocio: <Building className="h-4 w-4" />,
      visaoFuturo: <TrendingUp className="h-4 w-4" />,
      financeiro: <DollarSign className="h-4 w-4" />,
      infraestrutura: <Settings className="h-4 w-4" />,
      status: <Clock className="h-4 w-4" />
    };

    return (
      <AccordionItem key={sectionKey} value={sectionKey} className="border-border/50">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            {sectionIcons[sectionKey as keyof typeof sectionIcons]}
            <span className="text-base font-medium">{section.titulo}</span>
            <Badge variant="secondary" className="text-xs">
              {perguntasComResposta.length} {perguntasComResposta.length === 1 ? 'resposta' : 'respostas'}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-1">
            {perguntasComResposta.map(([fieldKey, pergunta]) => {
              let valor = sectionObj[fieldKey] || respostas[fieldKey];
              
              // Para seção visaoFuturo, pegar dados diretamente do lead se disponível
              if (sectionKey === 'visaoFuturo') {
                if (fieldKey === 'visao_futuro_texto') valor = lead.visao_futuro_texto || valor;
                if (fieldKey === 'audio_visao_futuro') valor = lead.audio_visao_futuro || valor;
              }
              
              // Para seção negocio, pegar novos campos do lead
              if (sectionKey === 'negocio') {
                if (fieldKey === 'produto_descricao') valor = lead.produto_descricao || valor;
                if (fieldKey === 'valor_medio_produto') valor = lead.valor_medio_produto || valor;
                if (fieldKey === 'ja_teve_vendas') valor = lead.ja_teve_vendas || valor;
              }
              
              // Para seção status, pegar planejamento estratégico do lead
              if (sectionKey === 'status' && fieldKey === 'planejamento_estrategico') {
                valor = lead.planejamento_estrategico || valor;
              }
              
              return renderQuestionAnswer(pergunta, valor, fieldKey);
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Detalhes Completos do Lead
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* SEÇÃO 1: RESUMO ESTRATÉGICO */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Resumo Estratégico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-3 rounded-lg border border-border/20">
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
                
                <div className="bg-background/50 p-3 rounded-lg border border-border/20">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <Building className="h-4 w-4" />
                    Tipo de Negócio
                  </div>
                  <Badge variant="outline" className="text-sm font-medium">
                    {lead.tipo_negocio}
                  </Badge>
                </div>

                {lead.email_usuario && (
                  <div className="bg-background/50 p-3 rounded-lg border border-border/20">
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

          {/* SEÇÃO 2: PLANEJAMENTO ESTRATÉGICO */}
          {lead.planejamento_estrategico && (
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Planejamento Estratégico Gerado
                  <Badge className="bg-orange-100 text-orange-800 text-xs">IA</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background/70 p-4 rounded-lg border border-border/30">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">
                      {lead.planejamento_estrategico}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEÇÃO 3: TODAS AS PERGUNTAS E RESPOSTAS DO FORMULÁRIO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Respostas Completas do Formulário
                <Badge variant="outline" className="text-xs">
                  Todas as Perguntas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={["dadosPersonais", "negocio"]} className="w-full">
                {Object.keys(FORMULARIO_PERGUNTAS).map(sectionKey => 
                  renderFormSection(sectionKey, dadosOrganizados)
                )}
                
                {/* Seção especial para dados não categorizados */}
                {Object.keys(dadosOrganizados.outras).length > 0 && (
                  <AccordionItem value="outras" className="border-border/50">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4" />
                        <span className="text-base font-medium">🔍 Outras Informações</span>
                        <Badge variant="secondary" className="text-xs">
                          {Object.keys(dadosOrganizados.outras).length} {Object.keys(dadosOrganizados.outras).length === 1 ? 'item' : 'itens'}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-1">
                        {Object.entries(dadosOrganizados.outras).map(([key, value]) => 
                          renderQuestionAnswer(formatFieldName(key), value, key)
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}