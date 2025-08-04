import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Funnel,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface ClienteParceriaData {
  id: string;
  email_cliente: string;
  nome_cliente: string | null;
  telefone: string | null;
  dados_formulario: any;
  created_at: string;
  ativo: boolean;
}

interface FunilStep {
  id: number;
  title: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  priority: 'alta' | 'media' | 'baixa';
}

export default function ClienteParceiriaDashboard() {
  const { user } = useAuth();
  const [clienteData, setClienteData] = useState<ClienteParceriaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dados');

  // Steps do funil padrão (será customizável no futuro)
  const [funilSteps] = useState<FunilStep[]>([
    {
      id: 1,
      title: 'Definição de Avatar',
      description: 'Identificar e definir o perfil ideal do cliente',
      status: 'pendente',
      priority: 'alta'
    },
    {
      id: 2,
      title: 'Criação de Conteúdo',
      description: 'Desenvolver materiais e criativos para as campanhas',
      status: 'pendente',
      priority: 'alta'
    },
    {
      id: 3,
      title: 'Configuração do Pixel',
      description: 'Instalar e configurar pixel de rastreamento',
      status: 'pendente',
      priority: 'media'
    },
    {
      id: 4,
      title: 'Estruturação de Landing Page',
      description: 'Criar ou otimizar página de captura/vendas',
      status: 'pendente',
      priority: 'alta'
    },
    {
      id: 5,
      title: 'Configuração do CRM',
      description: 'Integrar e configurar sistema de relacionamento',
      status: 'pendente',
      priority: 'media'
    },
    {
      id: 6,
      title: 'Testes de Campanhas',
      description: 'Realizar testes A/B e otimizações iniciais',
      status: 'pendente',
      priority: 'baixa'
    }
  ]);

  useEffect(() => {
    if (user?.email) {
      fetchClienteData();
    }
  }, [user]);

  const fetchClienteData = async () => {
    try {
      console.log('🔍 [ClienteParceiriaDashboard] Buscando dados do cliente:', user?.email);
      
      const { data, error } = await supabase
        .from('clientes_parceria')
        .select('*')
        .eq('email_cliente', user?.email)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('❌ [ClienteParceiriaDashboard] Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do cliente');
        return;
      }

      console.log('✅ [ClienteParceiriaDashboard] Dados encontrados:', data);
      setClienteData(data);
    } catch (error) {
      console.error('❌ [ClienteParceiriaDashboard] Erro:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'border-l-red-500';
      case 'media':
        return 'border-l-yellow-500';
      default:
        return 'border-l-green-500';
    }
  };

  const renderFormData = () => {
    if (!clienteData?.dados_formulario) return null;

    const dados = clienteData.dados_formulario;
    
    return (
      <div className="space-y-4">
        {Object.entries(dados).map(([key, value]: [string, any]) => {
          if (!value || value === '') return null;
          
          return (
            <div key={key} className="border-b pb-2">
              <dt className="text-sm font-medium text-gray-600 capitalize">
                {key.replace(/_/g, ' ')}
              </dt>
              <dd className="text-sm text-gray-900 mt-1">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </dd>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!clienteData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Dados não encontrados</h1>
          <p className="text-gray-600">Não foi possível encontrar seus dados de parceria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Parceria Tráfego Porcents %
                  </h1>
                  <p className="text-gray-600">
                    Bem-vindo, {clienteData.nome_cliente || 'Cliente Parceria'}!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Cliente desde</p>
                <p className="text-sm font-medium">
                  {new Date(clienteData.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dados do Formulário
            </TabsTrigger>
            <TabsTrigger value="funil" className="flex items-center gap-2">
              <Funnel className="h-4 w-4" />
              Estruturação do Funil
            </TabsTrigger>
          </TabsList>

          {/* Dados do Formulário */}
          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações do Formulário
                </CardTitle>
                <CardDescription>
                  Dados coletados durante o processo de cadastro na parceria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-sm">{clienteData.email_cliente}</p>
                      </div>
                      {clienteData.telefone && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Telefone</p>
                          <p className="text-sm">{clienteData.telefone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dados do Formulário</h3>
                    <div className="max-h-96 overflow-y-auto">
                      {renderFormData()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estruturação do Funil */}
          <TabsContent value="funil">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Funnel className="h-5 w-5" />
                    Estruturação do Funil de Vendas
                  </CardTitle>
                  <CardDescription>
                    Etapas necessárias para estruturar e otimizar seu funil de tráfego
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {funilSteps.map((step) => (
                      <Card key={step.id} className={`border-l-4 ${getPriorityColor(step.priority)}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{step.title}</CardTitle>
                            {getStatusBadge(step.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              Prioridade: {step.priority}
                            </Badge>
                            <Button size="sm" variant="outline" disabled>
                              Em Breve
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Geral */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Status Geral do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {funilSteps.filter(s => s.status === 'concluido').length}
                      </h3>
                      <p className="text-sm text-gray-600">Etapas Concluídas</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-600">
                        {funilSteps.filter(s => s.status === 'em_andamento').length}
                      </h3>
                      <p className="text-sm text-gray-600">Em Andamento</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-yellow-600">
                        {funilSteps.filter(s => s.status === 'pendente').length}
                      </h3>
                      <p className="text-sm text-gray-600">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}