import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔥 Kiwify webhook recebido');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se a integração está ativa
    const { data: config, error: configError } = await supabase
      .from('kiwify_config')
      .select('*')
      .eq('ativa', true)
      .single();

    if (configError || !config) {
      console.log('❌ Integração Kiwify não está ativa ou configurada');
      return new Response(
        JSON.stringify({ error: 'Integração não ativa' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Configuração Kiwify encontrada e ativa');

    // Ler dados do webhook
    const webhookData = await req.json();
    console.log('📦 Dados do webhook:', JSON.stringify(webhookData, null, 2));

    // Extrair email do comprador
    let emailComprador = null;
    
    // Possíveis campos onde o email pode estar (baseado na estrutura comum da Kiwify)
    if (webhookData.Customer?.email) {
      emailComprador = webhookData.Customer.email;
    } else if (webhookData.customer?.email) {
      emailComprador = webhookData.customer.email;
    } else if (webhookData.email) {
      emailComprador = webhookData.email;
    } else if (webhookData.buyer_email) {
      emailComprador = webhookData.buyer_email;
    }

    console.log('📧 Email do comprador extraído:', emailComprador);

    // Criar log inicial
    const { data: logData, error: logError } = await supabase
      .from('kiwify_webhook_logs')
      .insert({
        webhook_data: webhookData,
        email_comprador: emailComprador,
        status_processamento: 'processando'
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Erro ao criar log:', logError);
    }

    const logId = logData?.id;

    if (!emailComprador) {
      console.log('❌ Email do comprador não encontrado no webhook');
      
      // Atualizar log com erro
      if (logId) {
        await supabase
          .from('kiwify_webhook_logs')
          .update({
            status_processamento: 'erro',
            detalhes_erro: 'Email do comprador não encontrado no webhook'
          })
          .eq('id', logId);
      }

      return new Response(
        JSON.stringify({ 
          error: 'Email do comprador não encontrado',
          data: webhookData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar lead na tabela formularios_parceria
    const { data: lead, error: leadError } = await supabase
      .from('formularios_parceria')
      .select('*')
      .eq('email_usuario', emailComprador)
      .single();

    if (leadError || !lead) {
      console.log('❌ Lead não encontrado para o email:', emailComprador);
      
      // Atualizar log
      if (logId) {
        await supabase
          .from('kiwify_webhook_logs')
          .update({
            status_processamento: 'lead_nao_encontrado',
            detalhes_erro: `Lead não encontrado para o email: ${emailComprador}`,
            lead_encontrado: false
          })
          .eq('id', logId);
      }

      return new Response(
        JSON.stringify({ 
          message: 'Lead não encontrado, mas webhook processado',
          email: emailComprador,
          data: webhookData
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Lead encontrado:', lead.id);

    // Atualizar lead: marcar como pago e aceito
    const { error: updateError } = await supabase
      .from('formularios_parceria')
      .update({
        cliente_pago: true,
        status_negociacao: 'comprou',
        updated_at: new Date().toISOString()
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar lead:', updateError);
      
      // Atualizar log com erro
      if (logId) {
        await supabase
          .from('kiwify_webhook_logs')
          .update({
            status_processamento: 'erro',
            detalhes_erro: `Erro ao atualizar lead: ${updateError.message}`,
            lead_encontrado: true,
            lead_id: lead.id
          })
          .eq('id', logId);
      }

      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar lead' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🎉 Lead atualizado com sucesso! Agora está pago e aceito');

    // Atualizar log com sucesso
    if (logId) {
      await supabase
        .from('kiwify_webhook_logs')
        .update({
          status_processamento: 'sucesso',
          lead_encontrado: true,
          lead_id: lead.id
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Venda processada com sucesso',
        lead_id: lead.id,
        email: emailComprador
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Erro geral no webhook:', error);
    
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