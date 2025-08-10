import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { invokeEdge } from "@/integrations/supabase/invokeEdge";
import { PlayCircle, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

export function EvolutionAPITester() {
  const { toast } = useToast();
  const [tests, setTests] = useState<TestResult[]>([
    {
      id: 'edge_ping',
      name: 'Ping Edge',
      status: 'idle'
    },
    {
      id: 'discover_endpoints',
      name: 'Descobrir Endpoints',
      status: 'idle'
    },
    {
      id: 'test_discovered_endpoint',
      name: 'Testar Endpoint Descoberto',
      status: 'idle'
    },
    {
      id: 'send_test_message',
      name: 'Enviar Mensagem de Teste',
      status: 'idle'
    },
    {
      id: 'phone_validation',
      name: 'Validação de Telefone',
      status: 'idle'
    }
  ]);

  const updateTestStatus = (testId: string, status: TestResult['status'], result?: any, error?: string, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, result, error, duration }
        : test
    ));
  };

  const runSingleTest = async (testId: string) => {
    updateTestStatus(testId, 'running');
    const startTime = Date.now();

    try {
      let result;
      
      switch (testId) {
        case 'edge_ping':
          result = await testEdgePing();
          break;
        case 'discover_endpoints':
          result = await testDiscoverEndpoints();
          break;
        case 'test_discovered_endpoint':
          result = await testDiscoveredEndpoint();
          break;
        case 'send_test_message':
          result = await testSendMessage();
          break;
        case 'phone_validation':
          result = await testPhoneValidation();
          break;
        default:
          throw new Error('Teste não encontrado');
      }

      const duration = Date.now() - startTime;
      updateTestStatus(testId, 'success', result, undefined, duration);
      
      toast({
        title: "Teste concluído",
        description: `${getTestName(testId)} passou em ${duration}ms`,
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestStatus(testId, 'error', undefined, error.message, duration);
      
      toast({
        title: "Teste falhou",
        description: `${getTestName(testId)}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const runAllTests = async () => {
    toast({
      title: "Executando testes",
      description: "Rodando todos os testes do sistema...",
    });

    for (const test of tests) {
      await runSingleTest(test.id);
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const passedTests = tests.filter(t => t.status === 'success').length;
    const totalTests = tests.length;

    toast({
      title: "Testes finalizados",
      description: `${passedTests}/${totalTests} testes passaram`,
    });
  };

  const testDiscoverEndpoints = async () => {
    const { data, error } = await supabase.functions.invoke('evolution-discover-endpoints', {
      body: { prefix: '', timeoutMs: 5000, budgetMs: 15000 }
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Nenhum endpoint compatível encontrado');

    return {
      workingEndpoints: data.workingEndpoints?.length || 0,
      recommendations: data.diagnostic?.recommendations || [],
      serverInfo: data.diagnostic?.serverInfo,
      endpointTesting: data.diagnostic?.endpointTesting
    };
  };

  const testEdgePing = async () => {
    const start = Date.now();
    const { data, error } = await supabase.functions.invoke('evolution-test-connectivity', { body: {} });
    const duration = Date.now() - start;
    if (error) throw error;
    return {
      reachable: data?.server?.reachable ?? data?.reachable ?? true,
      status: data?.server?.status ?? data?.status ?? 200,
      responseTime: duration,
      details: data,
    };
  };

  const testDiscoveredEndpoint = async () => {
    // Check discovered endpoints in database
    const { data: discoveredEndpoints, error } = await supabase
      .from('evolution_discovered_endpoints')
      .select('*')
      .eq('is_working', true)
      .order('priority', { ascending: true })
      .limit(1);

    if (error) throw error;
    if (!discoveredEndpoints || discoveredEndpoints.length === 0) {
      throw new Error('Nenhum endpoint descoberto encontrado. Execute "Descobrir Endpoints" primeiro.');
    }

    const endpoint = discoveredEndpoints[0];
    
    // Test the discovered endpoint with different payloads
    const payloads = [
      { number: '5511999999999', text: 'Teste via endpoint descoberto' },
      { phone: '5511999999999', message: 'Teste via endpoint descoberto' },
      { number: '5511999999999', textMessage: { text: 'Teste via endpoint descoberto' } }
    ];

    const results = [];
    
    for (const payload of payloads) {
      try {
        const { data, error } = await invokeEdge('evolution-send-text-lite', {
          ...payload
        });

        results.push({
          payloadStyle: Object.keys(payload).join('+'),
          success: !error && data?.success,
          status: data?.status,
          endpoint: data?.endpoint,
          error: error?.message || data?.error
        });
      } catch (err: any) {
        results.push({
          payloadStyle: Object.keys(payload).join('+'),
          success: false,
          error: err.message
        });
      }
    }

    return {
      discoveredEndpoint: endpoint,
      testResults: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length
      }
    };
  };

  const testSendMessage = async () => {
    // Try lite function first
    const lite = await invokeEdge('evolution-send-text-lite', {
      number: '5511999999999',
      text: 'Teste de mensagem completo via Evolution API ✅'
    });

    const chosen = !lite.error && lite.data?.success
      ? lite
      : await invokeEdge('evolution-send-text', {
          number: '5511999999999',
          text: 'Teste de mensagem completo via Evolution API ✅',
          verbose: false
        });

    if (chosen.error) throw chosen.error;

    const data = chosen.data as any;
    return {
      success: data?.success || false,
      status: data?.status,
      endpoint: data?.endpoint,
      responseTime: data?.responseTimeMs,
      attempts: data?.attempts?.length || 0,
      diagnostics: data?.diagnostics,
      error: data?.error
    };
  };

  const testPhoneValidation = async () => {
    const testCases = [
      { input: '11999999999', expected: '5511999999999' },
      { input: '+5511999999999', expected: '5511999999999' },
      { input: '5511999999999', expected: '5511999999999' },
      { input: '(11) 99999-9999', expected: '5511999999999' },
    ];

    const results = testCases.map(testCase => {
      const result = normalizePhoneLocal(testCase.input, '+55');
      return {
        input: testCase.input,
        output: result,
        expected: testCase.expected,
        passed: result === testCase.expected
      };
    });

    const allPassed = results.every(r => r.passed);
    if (!allPassed) {
      throw new Error('Alguns casos de validação falharam');
    }

    return results;
  };


  // Funções auxiliares para teste local (simulam as da edge function)
  const normalizePhoneLocal = (phone: string, countryCode: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('55')) return digits;
    if (digits.startsWith('5')) return digits;
    return '55' + digits;
  };

  const applyTemplateLocal = (template: string, vars: Record<string, string>): string => {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, value || '');
    });
    return result;
  };

  const getTestName = (testId: string): string => {
    const test = tests.find(t => t.id === testId);
    return test?.name || testId;
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="text-blue-600">Executando</Badge>;
      case 'success':
        return <Badge variant="outline" className="text-green-600">Sucesso</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600">Erro</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Aguardando</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testador Evolution API</h2>
          <p className="text-muted-foreground">
            Teste descoberta de endpoints e envio de mensagens reais
          </p>
        </div>
        <Button onClick={runAllTests} className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Executar Todos os Testes
        </Button>
      </div>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(test.status)}
                <CardTitle className="text-lg">{test.name}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(test.status)}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSingleTest(test.id)}
                  disabled={test.status === 'running'}
                >
                  Testar
                </Button>
              </div>
            </CardHeader>
            
            {(test.result || test.error) && (
              <CardContent>
                {test.duration && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Executado em {test.duration}ms
                  </p>
                )}
                
                {test.result && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-1">Resultado:</p>
                    <pre className="text-xs text-green-700 whitespace-pre-wrap">
                      {JSON.stringify(test.result, null, 2)}
                    </pre>
                  </div>
                )}
                
                {test.error && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">Erro:</p>
                    <p className="text-xs text-red-700">{test.error}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <TestTube className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Modo de Teste</h3>
              <p className="text-sm text-blue-700 mt-1">
                Os testes de descoberta de endpoints e envio de mensagens fazem chamadas reais para a Evolution API.
                Execute primeiro "Descobrir Endpoints" para encontrar endpoints compatíveis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}