
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaxPedido {
  id?: string;
  pedido_id?: string;
  nome_cliente?: string;
  nome?: string;
  cliente_nome?: string;
  telefone?: string;
  celular?: string;
  whatsapp?: string;
  email_cliente?: string;
  email?: string;
  cliente_email?: string;
  produto?: string;
  produto_nome?: string;
  item?: string;
  valor?: number;
  preco?: number;
  total?: number;
  data_pedido?: string;
  data_aprovacao?: string;
  data_compra?: string;
  created_at?: string;
  observacoes?: string;
  observacao?: string;
  descricao?: string;
  status?: string;
  [key: string]: any; // Para capturar campos extras
}

async function logToDatabase(supabase: any, logData: any) {
  try {
    const { error } = await supabase
      .from('max_integration_logs')
      .insert(logData);
    
    if (error) {
      console.error('❌ [Max Webhook] Erro ao salvar log no banco:', error);
    }
  } catch (err) {
    console.error('❌ [Max Webhook] Erro crítico ao salvar log:', err);
  }
}

function extractClientData(rawData: any): MaxPedido {
  console.log('🔍 [Max Webhook] Extraindo dados do cliente...');
  
  // Tentar diferentes estruturas de dados
  const data = rawData.data || rawData.pedido || rawData.order || rawData;
  
  // Mapear diferentes possibilidades de campos
  const clientData: MaxPedido = {
    id: data.id || data.pedido_id || data.order_id || `max-${Date.now()}`,
    nome_cliente: data.nome_cliente || data.nome || data.cliente_nome || data.customer_name || data.buyer_name,
    telefone: data.telefone || data.celular || data.whatsapp || data.phone || data.mobile,
    email_cliente: data.email_cliente || data.email || data.cliente_email || data.customer_email,
    produto: data.produto || data.produto_nome || data.item || data.product_name || 'Produto App Max',
    valor: parseFloat(data.valor || data.preco || data.total || data.amount || 0),
    data_pedido: data.data_pedido || data.data_aprovacao || data.data_compra || data.created_at || new Date().toISOString(),
    observacoes: data.observacoes || data.observacao || data.descricao || data.notes || 'Importado automaticamente do App Max'
  };

  console.log('📋 [Max Webhook] Dados extraídos:', JSON.stringify(clientData, null, 2));
  return clientData;
}

serve(async (req) => {
  const requestId = `req-${Date.now()}`;
  console.log(`🚀 [Max Webhook ${requestId}] ===== NOVA REQUISIÇÃO WEBHOOK =====`);
  console.log(`📨 [Max Webhook ${requestId}] Método: ${req.method}`);
  console.log(`🔗 [Max Webhook ${requestId}] URL: ${req.url}`);
  console.log(`⏰ [Max Webhook ${requestId}] Timestamp: ${new Date().toISOString()}`);
  
  // Capturar headers para debugging
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log(`📋 [Max Webhook ${requestId}] Headers completos:`, JSON.stringify(headers, null, 2));
  
  // Log específico do User-Agent para identificar origem
  const userAgent = req.headers.get('user-agent') || 'unknown';
  console.log(`🔍 [Max Webhook ${requestId}] User-Agent: ${userAgent}`);
  
  // Log do Content-Type para verificar formato
  const contentType = req.headers.get('content-type') || 'unknown';
  console.log(`📄 [Max Webhook ${requestId}] Content-Type: ${contentType}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [Max Webhook ${requestId}] Respondendo OPTIONS com CORS headers`);
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let rawBody: any = null;
  let pedidoId = `unknown-${Date.now()}`;

  try {
    // Tentar capturar o corpo da requisição
    const bodyText = await req.text();
    console.log(`📦 [Max Webhook ${requestId}] CORPO COMPLETO DA REQUISIÇÃO:`, bodyText);
    console.log(`📊 [Max Webhook ${requestId}] Tamanho do corpo: ${bodyText.length} bytes`);

    if (bodyText.trim()) {
      try {
        rawBody = JSON.parse(bodyText);
        console.log(`✅ [Max Webhook ${requestId}] JSON parseado com sucesso`);
        console.log(`📦 [Max Webhook ${requestId}] DADOS ESTRUTURADOS:`, JSON.stringify(rawBody, null, 2));
      } catch (parseError) {
        console.log(`⚠️ [Max Webhook ${requestId}] ERRO AO FAZER PARSE DO JSON:`, parseError);
        console.log(`📝 [Max Webhook ${requestId}] Tentando processar como texto simples...`);
        
        // Tentar processar como form-data ou query string
        const isFormData = contentType.includes('application/x-www-form-urlencoded');
        const isMultipart = contentType.includes('multipart/form-data');
        
        if (isFormData) {
          console.log(`📝 [Max Webhook ${requestId}] Detectado form-data, processando...`);
          try {
            const formData = new URLSearchParams(bodyText);
            rawBody = Object.fromEntries(formData.entries());
            console.log(`✅ [Max Webhook ${requestId}] Form-data processado:`, JSON.stringify(rawBody, null, 2));
          } catch (formError) {
            console.log(`❌ [Max Webhook ${requestId}] Erro ao processar form-data:`, formError);
            rawBody = { raw_text: bodyText, parse_error: parseError.message, form_error: formError.message };
          }
        } else {
          rawBody = { raw_text: bodyText, parse_error: parseError.message, content_type: contentType };
        }
      }
    } else {
      console.log(`⚠️ [Max Webhook ${requestId}] CORPO DA REQUISIÇÃO VAZIO!`);
      rawBody = { 
        message: 'Corpo vazio - possível problema na configuração do AppMax', 
        method: req.method, 
        headers,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      };
    }

    // Extrair ID do pedido para logs
    if (rawBody && typeof rawBody === 'object') {
      pedidoId = rawBody.id || rawBody.pedido_id || rawBody.order_id || rawBody.transaction_id || pedidoId;
      console.log(`🆔 [Max Webhook ${requestId}] ID do pedido identificado: ${pedidoId}`);
    }

    // Log inicial SEMPRE é criado, mesmo com dados incompletos
    const initialLog = {
      pedido_id: pedidoId,
      status: 'processando',
      dados_originais: {
        ...rawBody,
        _webhook_meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          method: req.method,
          headers: headers,
          user_agent: userAgent,
          content_type: contentType,
          body_size: bodyText?.length || 0
        }
      },
      gestor_atribuido: null,
      erro_detalhes: null
    };

    console.log(`💾 [Max Webhook ${requestId}] Criando log inicial detalhado...`);
    const { data: logData, error: logError } = await supabase
      .from('max_integration_logs')
      .insert(initialLog)
      .select()
      .single();

    if (logError) {
      console.error(`❌ [Max Webhook ${requestId}] ERRO CRÍTICO ao criar log inicial:`, logError);
      // Continuar mesmo se o log falhar
    } else {
      console.log(`✅ [Max Webhook ${requestId}] Log inicial criado com ID: ${logData?.id}`);
    }

    // Verificar se há dados suficientes para processar
    if (!rawBody || typeof rawBody !== 'object' || Object.keys(rawBody).length === 0) {
      const errorMsg = `❌ DADOS INSUFICIENTES - Webhook chamado mas sem dados válidos. Verifique configuração no AppMax.`;
      console.log(`${errorMsg} Request ID: ${requestId}`);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            erro_detalhes: `${errorMsg} | Método: ${req.method} | User-Agent: ${userAgent} | Content-Type: ${contentType}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          request_id: requestId,
          method: req.method,
          received_data: rawBody,
          webhook_url: req.url,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar configuração ativa
    console.log(`⚙️ [Max Webhook ${requestId}] Buscando configuração ativa...`);
    const { data: config, error: configError } = await supabase
      .from('max_integration_config')
      .select('*')
      .eq('integration_active', true)
      .single();

    if (configError || !config) {
      const errorMsg = `❌ INTEGRAÇÃO INATIVA - Webhook recebido mas integração está desativada no sistema`;
      console.error(`${errorMsg} Request ID: ${requestId}`, configError);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            erro_detalhes: `${errorMsg} | Erro: ${configError?.message || 'Configuração não encontrada'}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          error: errorMsg, 
          request_id: requestId,
          details: configError?.message || 'Configuração não encontrada'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ [Max Webhook ${requestId}] Configuração ativa encontrada - Gestor: ${config.gestor_nome}`);

    // Extrair dados do cliente com mapeamento flexível
    const clienteData = extractClientData(rawBody);
    console.log(`📋 [Max Webhook ${requestId}] Dados do cliente extraídos:`, JSON.stringify(clienteData, null, 2));
    
    // Validar dados essenciais com fallbacks
    if (!clienteData.nome_cliente || !clienteData.telefone) {
      const errorMsg = `❌ DADOS OBRIGATÓRIOS FALTANDO - Nome: '${clienteData.nome_cliente || 'AUSENTE'}' | Telefone: '${clienteData.telefone || 'AUSENTE'}'`;
      console.error(`${errorMsg} Request ID: ${requestId}`);
      console.log(`🔍 [Max Webhook ${requestId}] Estrutura de dados recebida para debug:`, Object.keys(rawBody));
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            gestor_atribuido: config.gestor_email,
            erro_detalhes: `${errorMsg} | Estrutura recebida: ${JSON.stringify(Object.keys(rawBody))}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          request_id: requestId,
          received_data: clienteData,
          data_structure: Object.keys(rawBody),
          help: "Verifique se o AppMax está enviando os campos 'nome_cliente' e 'telefone' corretamente"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se cliente já existe (por email ou telefone)
    console.log(`🔍 [Max Webhook ${requestId}] Verificando se cliente já existe...`);
    let clienteExiste = false;
    let clienteExistente = null;

    if (clienteData.email_cliente) {
      const { data: existingByEmail } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente')
        .eq('email_cliente', clienteData.email_cliente)
        .single();
      
      if (existingByEmail) {
        clienteExiste = true;
        clienteExistente = existingByEmail;
        console.log(`🔍 [Max Webhook ${requestId}] Cliente encontrado por email: ${existingByEmail.nome_cliente}`);
      }
    }

    // Se não encontrou por email, buscar por telefone
    if (!clienteExiste && clienteData.telefone) {
      const { data: existingByPhone } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, telefone')
        .eq('telefone', clienteData.telefone)
        .single();
      
      if (existingByPhone) {
        clienteExiste = true;
        clienteExistente = existingByPhone;
        console.log(`🔍 [Max Webhook ${requestId}] Cliente encontrado por telefone: ${existingByPhone.nome_cliente}`);
      }
    }

    if (clienteExiste && clienteExistente) {
      console.log(`⚠️ [Max Webhook ${requestId}] CLIENTE DUPLICADO - Nome: ${clienteExistente.nome_cliente} | ID: ${clienteExistente.id}`);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'duplicado',
            cliente_criado_id: clienteExistente.id,
            gestor_atribuido: config.gestor_email,
            erro_detalhes: `Cliente já existe no sistema - Nome: ${clienteExistente.nome_cliente} | ID: ${clienteExistente.id}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          message: 'Cliente já existe no sistema',
          cliente_id: clienteExistente.id,
          cliente_nome: clienteExistente.nome_cliente,
          request_id: requestId,
          status: 'duplicado'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar novo cliente com dados inteligentes
    const novoCliente = {
      nome_cliente: clienteData.nome_cliente,
      telefone: clienteData.telefone,
      email_cliente: clienteData.email_cliente || `${clienteData.telefone}@appmax.temp`,
      vendedor: clienteData.produto || 'App Max',
      email_gestor: config.gestor_email,
      status_campanha: 'Cliente Novo',
      data_venda: clienteData.data_pedido ? new Date(clienteData.data_pedido).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      valor_comissao: 60.00,
      comissao: 'Pendente',
      site_status: 'pendente',
      site_pago: false,
      descricao_problema: `${clienteData.observacoes} | Pedido App Max #${clienteData.id} | Valor: R$ ${clienteData.valor || 0} | Request ID: ${requestId}`
    };

    console.log(`💾 [Max Webhook ${requestId}] Criando novo cliente: ${novoCliente.nome_cliente}`);
    console.log(`📋 [Max Webhook ${requestId}] Dados do cliente:`, JSON.stringify(novoCliente, null, 2));

    const { data: clienteCriado, error: clienteError } = await supabase
      .from('todos_clientes')
      .insert(novoCliente)
      .select()
      .single();

    if (clienteError) {
      console.error(`❌ [Max Webhook ${requestId}] ERRO AO CRIAR CLIENTE:`, clienteError);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            gestor_atribuido: config.gestor_email,
            erro_detalhes: `Erro ao criar cliente: ${clienteError.message} | Código: ${clienteError.code}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar cliente', 
          details: clienteError.message,
          code: clienteError.code,
          request_id: requestId
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Atualizar log com sucesso
    if (logData?.id) {
      await supabase
        .from('max_integration_logs')
        .update({
          status: 'sucesso',
          cliente_criado_id: clienteCriado.id,
          gestor_atribuido: config.gestor_email,
          processed_at: new Date().toISOString()
        })
        .eq('id', logData.id);
    }

    console.log(`🎉 [Max Webhook ${requestId}] ===== CLIENTE CRIADO COM SUCESSO =====`);
    console.log(`✅ [Max Webhook ${requestId}] ID do Cliente: ${clienteCriado.id}`);
    console.log(`✅ [Max Webhook ${requestId}] Nome: ${clienteCriado.nome_cliente}`);
    console.log(`✅ [Max Webhook ${requestId}] Gestor: ${config.gestor_nome}`);
    console.log(`✅ [Max Webhook ${requestId}] Email Gestor: ${config.gestor_email}`);
    console.log(`✅ [Max Webhook ${requestId}] Request ID: ${requestId}`);
    console.log(`🏁 [Max Webhook ${requestId}] ===== PROCESSAMENTO CONCLUÍDO =====`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cliente criado e atribuído com sucesso',
        cliente_id: clienteCriado.id,
        cliente_nome: clienteCriado.nome_cliente,
        gestor_atribuido: config.gestor_nome,
        request_id: requestId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error(`💥 [Max Webhook ${requestId}] ===== ERRO CRÍTICO =====`);
    console.error(`💥 [Max Webhook ${requestId}] Erro:`, error);
    console.error(`💥 [Max Webhook ${requestId}] Stack:`, error.stack);
    
    // Tentar salvar erro no log mesmo em caso de falha crítica
    try {
      await logToDatabase(supabase, {
        pedido_id: pedidoId,
        status: 'erro',
        dados_originais: {
          ...(rawBody || { error: 'Falha ao capturar dados' }),
          _webhook_meta: {
            request_id: requestId,
            timestamp: new Date().toISOString(),
            critical_error: true,
            error_message: error.message,
            error_stack: error.stack
          }
        },
        gestor_atribuido: null,
        erro_detalhes: `ERRO CRÍTICO: ${error.message} | Request ID: ${requestId}`
      });
    } catch (logErr) {
      console.error(`💥 [Max Webhook ${requestId}] FALHA CRÍTICA ao salvar log de erro:`, logErr);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message,
        request_id: requestId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
