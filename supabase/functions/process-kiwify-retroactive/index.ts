import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessRequest {
  emails: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando processamento retroativo de vendas Kiwify');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { emails }: ProcessRequest = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      console.log('❌ Lista de emails inválida ou vazia');
      return new Response(
        JSON.stringify({ success: false, error: 'Lista de emails é obrigatória' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📧 Processando ${emails.length} emails de vendas aprovadas`);

    const results = {
      processados: 0,
      atualizados: 0,
      ja_pagos: 0,
      nao_encontrados: 0,
      erros: 0,
      detalhes: [] as any[]
    };

    // Processar cada email
    for (const email of emails) {
      try {
        console.log(`🔍 Processando email: ${email}`);
        results.processados++;

        // Buscar lead na tabela formularios_parceria
        const { data: lead, error: selectError } = await supabase
          .from('formularios_parceria')
          .select('id, email_usuario, cliente_pago, status_negociacao')
          .eq('email_usuario', email.trim())
          .single();

        if (selectError || !lead) {
          console.log(`❌ Lead não encontrado para email: ${email}`);
          results.nao_encontrados++;
          results.detalhes.push({
            email,
            status: 'nao_encontrado',
            erro: selectError?.message || 'Lead não encontrado'
          });
          continue;
        }

        // Verificar se já está pago
        if (lead.cliente_pago === true || lead.status_negociacao === 'comprou') {
          console.log(`✅ Lead já estava pago para email: ${email}`);
          results.ja_pagos++;
          results.detalhes.push({
            email,
            status: 'ja_pago',
            lead_id: lead.id
          });
          continue;
        }

        // Atualizar lead para pago
        const { error: updateError } = await supabase
          .from('formularios_parceria')
          .update({
            cliente_pago: true,
            status_negociacao: 'comprou',
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);

        if (updateError) {
          console.log(`❌ Erro ao atualizar lead ${lead.id}:`, updateError);
          results.erros++;
          results.detalhes.push({
            email,
            status: 'erro',
            lead_id: lead.id,
            erro: updateError.message
          });
          continue;
        }

        console.log(`✅ Lead atualizado com sucesso: ${email} (ID: ${lead.id})`);

        // Garantir registro em clientes_parceria
        try {
          const { data: existingCliente } = await supabase
            .from('clientes_parceria')
            .select('id')
            .eq('email_cliente', email.trim())
            .maybeSingle();

          if (!existingCliente) {
            console.log('👤 Criando clientes_parceria para', email);
            await supabase.from('clientes_parceria').insert({
              email_cliente: email.trim(),
              nome_cliente: 'Cliente Parceria',
              lead_id: lead.id,
              dados_formulario: null,
            });
          }
        } catch (cpErr) {
          console.warn('⚠️ Erro ao garantir clientes_parceria (não crítico):', cpErr);
        }

        // Criar usuário Auth automaticamente
        let userCreateStatus: 'user_created' | 'user_create_failed' = 'user_created';
        try {
          const { data: createResp, error: createErr } = await supabase.functions.invoke('create-parceria-user', {
            body: { email: email.trim() }
          });
          if (createErr) {
            userCreateStatus = 'user_create_failed';
            console.error('❌ Erro ao invocar create-parceria-user:', createErr);
          } else {
            console.log('✅ Usuário Auth criado/resolvido:', createResp);
          }
        } catch (invokeErr) {
          userCreateStatus = 'user_create_failed';
          console.error('❌ Falha ao chamar create-parceria-user:', invokeErr);
        }

        results.atualizados++;
        results.detalhes.push({
          email,
          status: 'atualizado',
          lead_id: lead.id,
          auth_status: userCreateStatus,
        });

      } catch (error) {
        console.log(`❌ Erro ao processar email ${email}:`, error);
        results.erros++;
        results.detalhes.push({
          email,
          status: 'erro',
          erro: error.message
        });
      }
    }

    console.log('📊 Resumo do processamento:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Processamento retroativo concluído',
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro geral no processamento:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
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