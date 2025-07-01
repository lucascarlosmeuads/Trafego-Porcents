
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaxPedido {
  id: string;
  nome_cliente: string;
  telefone: string;
  email_cliente: string;
  produto?: string;
  valor?: number;
  data_pedido?: string;
  observacoes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 [Max Webhook] Recebendo pedido do App Max...');
    
    const body = await req.json();
    console.log('📦 [Max Webhook] Dados recebidos:', JSON.stringify(body, null, 2));

    // Log inicial do pedido
    const { data: logData, error: logError } = await supabase
      .from('max_integration_logs')
      .insert({
        pedido_id: body.id || `unknown-${Date.now()}`,
        status: 'processando',
        dados_originais: body,
        gestor_atribuido: null,
        erro_detalhes: null
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ [Max Webhook] Erro ao criar log:', logError);
      throw new Error('Erro ao registrar log inicial');
    }

    // Buscar configuração ativa
    const { data: config, error: configError } = await supabase
      .from('max_integration_config')
      .select('*')
      .eq('integration_active', true)
      .single();

    if (configError || !config) {
      console.error('❌ [Max Webhook] Configuração não encontrada ou inativa:', configError);
      
      // Atualizar log com erro
      await supabase
        .from('max_integration_logs')
        .update({
          status: 'erro',
          erro_detalhes: 'Integração não configurada ou inativa'
        })
        .eq('id', logData.id);

      return new Response(
        JSON.stringify({ error: 'Integração não configurada ou inativa' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('⚙️ [Max Webhook] Configuração encontrada:', config.gestor_nome);

    // Mapear dados do Max para o sistema
    const pedidoMax: MaxPedido = body;
    
    // Validar dados obrigatórios
    if (!pedidoMax.nome_cliente || !pedidoMax.telefone) {
      const errorMsg = 'Dados obrigatórios faltando: nome_cliente ou telefone';
      console.error('❌ [Max Webhook]', errorMsg);
      
      await supabase
        .from('max_integration_logs')
        .update({
          status: 'erro',
          erro_detalhes: errorMsg
        })
        .eq('id', logData.id);

      return new Response(
        JSON.stringify({ error: errorMsg }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se cliente já existe (por email ou telefone)
    let clienteExiste = false;
    if (pedidoMax.email_cliente) {
      const { data: existingClient } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente')
        .eq('email_cliente', pedidoMax.email_cliente)
        .single();
      
      if (existingClient) {
        clienteExiste = true;
        console.log('⚠️ [Max Webhook] Cliente já existe:', existingClient.nome_cliente);
        
        await supabase
          .from('max_integration_logs')
          .update({
            status: 'duplicado',
            cliente_criado_id: existingClient.id,
            gestor_atribuido: config.gestor_email,
            erro_detalhes: `Cliente já existe: ${existingClient.nome_cliente}`
          })
          .eq('id', logData.id);

        return new Response(
          JSON.stringify({ 
            message: 'Cliente já existe no sistema',
            cliente_id: existingClient.id 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Criar novo cliente
    const novoCliente = {
      nome_cliente: pedidoMax.nome_cliente,
      telefone: pedidoMax.telefone,
      email_cliente: pedidoMax.email_cliente || `${pedidoMax.telefone}@temp.com`,
      vendedor: pedidoMax.produto || 'App Max',
      email_gestor: config.gestor_email,
      status_campanha: 'Cliente Novo',
      data_venda: pedidoMax.data_pedido ? new Date(pedidoMax.data_pedido).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      valor_comissao: 60.00,
      comissao: 'Pendente',
      site_status: 'pendente',
      site_pago: false,
      descricao_problema: pedidoMax.observacoes || `Importado do App Max - Pedido #${pedidoMax.id}`
    };

    console.log('💾 [Max Webhook] Criando cliente:', novoCliente.nome_cliente);

    const { data: clienteCriado, error: clienteError } = await supabase
      .from('todos_clientes')
      .insert(novoCliente)
      .select()
      .single();

    if (clienteError) {
      console.error('❌ [Max Webhook] Erro ao criar cliente:', clienteError);
      
      await supabase
        .from('max_integration_logs')
        .update({
          status: 'erro',
          gestor_atribuido: config.gestor_email,
          erro_detalhes: `Erro ao criar cliente: ${clienteError.message}`
        })
        .eq('id', logData.id);

      return new Response(
        JSON.stringify({ error: 'Erro ao criar cliente', details: clienteError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Atualizar log com sucesso
    await supabase
      .from('max_integration_logs')
      .update({
        status: 'sucesso',
        cliente_criado_id: clienteCriado.id,
        gestor_atribuido: config.gestor_email,
        processed_at: new Date().toISOString()
      })
      .eq('id', logData.id);

    console.log('✅ [Max Webhook] Cliente criado com sucesso:', {
      id: clienteCriado.id,
      nome: clienteCriado.nome_cliente,
      gestor: config.gestor_nome
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cliente criado e atribuído com sucesso',
        cliente_id: clienteCriado.id,
        gestor_atribuido: config.gestor_nome
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 [Max Webhook] Erro inesperado:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
