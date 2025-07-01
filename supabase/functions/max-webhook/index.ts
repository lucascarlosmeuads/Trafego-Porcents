
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
  console.log(`🚀 [Max Webhook ${requestId}] Nova requisição recebida`);
  console.log(`📨 [Max Webhook ${requestId}] Método: ${req.method}`);
  console.log(`🔗 [Max Webhook ${requestId}] URL: ${req.url}`);
  
  // Capturar headers para debugging
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log(`📋 [Max Webhook ${requestId}] Headers:`, JSON.stringify(headers, null, 2));

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
    console.log(`📦 [Max Webhook ${requestId}] Corpo da requisição (raw):`, bodyText);

    if (bodyText.trim()) {
      try {
        rawBody = JSON.parse(bodyText);
        console.log(`📦 [Max Webhook ${requestId}] Dados JSON parseados:`, JSON.stringify(rawBody, null, 2));
      } catch (parseError) {
        console.log(`⚠️ [Max Webhook ${requestId}] Erro ao fazer parse do JSON:`, parseError);
        rawBody = { raw_text: bodyText, parse_error: parseError.message };
      }
    } else {
      console.log(`⚠️ [Max Webhook ${requestId}] Corpo da requisição vazio`);
      rawBody = { message: 'Corpo vazio', method: req.method, headers };
    }

    // Extrair ID do pedido para logs
    if (rawBody && typeof rawBody === 'object') {
      pedidoId = rawBody.id || rawBody.pedido_id || rawBody.order_id || pedidoId;
    }

    // Log inicial SEMPRE é criado, mesmo com dados incompletos
    const initialLog = {
      pedido_id: pedidoId,
      status: 'processando',
      dados_originais: rawBody,
      gestor_atribuido: null,
      erro_detalhes: null
    };

    console.log(`💾 [Max Webhook ${requestId}] Criando log inicial...`);
    const { data: logData, error: logError } = await supabase
      .from('max_integration_logs')
      .insert(initialLog)
      .select()
      .single();

    if (logError) {
      console.error(`❌ [Max Webhook ${requestId}] Erro ao criar log inicial:`, logError);
      // Continuar mesmo se o log falhar
    } else {
      console.log(`✅ [Max Webhook ${requestId}] Log inicial criado com ID:`, logData?.id);
    }

    // Verificar se há dados suficientes para processar
    if (!rawBody || typeof rawBody !== 'object' || Object.keys(rawBody).length === 0) {
      const errorMsg = 'Dados insuficientes ou formato inválido';
      console.log(`⚠️ [Max Webhook ${requestId}] ${errorMsg}`);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            erro_detalhes: `${errorMsg}. Método: ${req.method}, Headers: ${JSON.stringify(headers)}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          request_id: requestId,
          method: req.method,
          received_data: rawBody 
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
      const errorMsg = 'Integração não configurada ou inativa';
      console.error(`❌ [Max Webhook ${requestId}] ${errorMsg}:`, configError);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            erro_detalhes: errorMsg
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ error: errorMsg, request_id: requestId }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`⚙️ [Max Webhook ${requestId}] Configuração encontrada:`, config.gestor_nome);

    // Extrair dados do cliente com mapeamento flexível
    const clienteData = extractClientData(rawBody);
    
    // Validar dados essenciais com fallbacks
    if (!clienteData.nome_cliente || !clienteData.telefone) {
      const errorMsg = `Dados obrigatórios faltando. Nome: ${clienteData.nome_cliente || 'FALTANDO'}, Telefone: ${clienteData.telefone || 'FALTANDO'}`;
      console.error(`❌ [Max Webhook ${requestId}] ${errorMsg}`);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            gestor_atribuido: config.gestor_email,
            erro_detalhes: errorMsg
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          request_id: requestId,
          received_data: clienteData 
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
      }
    }

    if (clienteExiste && clienteExistente) {
      console.log(`⚠️ [Max Webhook ${requestId}] Cliente já existe:`, clienteExistente.nome_cliente);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'duplicado',
            cliente_criado_id: clienteExistente.id,
            gestor_atribuido: config.gestor_email,
            erro_detalhes: `Cliente já existe: ${clienteExistente.nome_cliente}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          message: 'Cliente já existe no sistema',
          cliente_id: clienteExistente.id,
          cliente_nome: clienteExistente.nome_cliente,
          request_id: requestId
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
      descricao_problema: `${clienteData.observacoes} | Pedido App Max #${clienteData.id} | Valor: R$ ${clienteData.valor || 0}`
    };

    console.log(`💾 [Max Webhook ${requestId}] Criando cliente:`, novoCliente.nome_cliente);

    const { data: clienteCriado, error: clienteError } = await supabase
      .from('todos_clientes')
      .insert(novoCliente)
      .select()
      .single();

    if (clienteError) {
      console.error(`❌ [Max Webhook ${requestId}] Erro ao criar cliente:`, clienteError);
      
      if (logData?.id) {
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'erro',
            gestor_atribuido: config.gestor_email,
            erro_detalhes: `Erro ao criar cliente: ${clienteError.message}`
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar cliente', 
          details: clienteError.message,
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

    console.log(`✅ [Max Webhook ${requestId}] Cliente criado com sucesso:`, {
      id: clienteCriado.id,
      nome: clienteCriado.nome_cliente,
      gestor: config.gestor_nome,
      request_id: requestId
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cliente criado e atribuído com sucesso',
        cliente_id: clienteCriado.id,
        cliente_nome: clienteCriado.nome_cliente,
        gestor_atribuido: config.gestor_nome,
        request_id: requestId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error(`💥 [Max Webhook ${requestId}] Erro inesperado:`, error);
    
    // Tentar salvar erro no log mesmo em caso de falha crítica
    try {
      await logToDatabase(supabase, {
        pedido_id: pedidoId,
        status: 'erro',
        dados_originais: rawBody || { error: 'Falha ao capturar dados' },
        gestor_atribuido: null,
        erro_detalhes: `Erro crítico: ${error.message}`
      });
    } catch (logErr) {
      console.error(`💥 [Max Webhook ${requestId}] Falha crítica ao salvar log de erro:`, logErr);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message,
        request_id: requestId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
