import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração de planejamento com assistente personalizado');
    
    const { emailCliente, campos } = await req.json();
    
    if (!emailCliente) {
      throw new Error('Email do cliente é obrigatório');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    // Buscar dados do formulário de parceria
    console.log('📋 Buscando dados do lead:', emailCliente);
    const { data: formulario, error: formularioError } = await supabase
      .from('formularios_parceria')
      .select('*')
      .eq('email_usuario', emailCliente)
      .single();

    if (formularioError || !formulario) {
      console.error('❌ Erro ao buscar formulário:', formularioError);
      throw new Error('Lead não encontrado');
    }

    // Estruturar dados para o assistente
    const dadosLead = {
      nome: formulario.respostas?.nome || 'Cliente',
      email: emailCliente,
      tipoNegocio: formulario.tipo_negocio || 'Não especificado',
      descricaoProduto: formulario.produto_descricao || 'Não especificado',
      visaoFuturo: formulario.visao_futuro_texto || 'Não especificado',
      respostasCompletas: formulario.respostas || {},
      vendedorResponsavel: formulario.vendedor_responsavel || 'Não atribuído'
    };

    // Criar prompt estruturado para o assistente
    const promptParaAssistente = `
DADOS DO LEAD PARA PLANEJAMENTO ESTRATÉGICO:

Nome: ${dadosLead.nome}
Email: ${dadosLead.email}
Tipo de Negócio: ${dadosLead.tipoNegocio}

Descrição do Produto/Serviço:
${dadosLead.descricaoProduto}

Visão de Futuro:
${dadosLead.visaoFuturo}

Vendedor Responsável: ${dadosLead.vendedorResponsavel}

RESPOSTAS COMPLETAS DO FORMULÁRIO:
${JSON.stringify(dadosLead.respostasCompletas, null, 2)}

Por favor, gere um planejamento estratégico completo e personalizado baseado nessas informações, seguindo sua expertise como "Planejador — Funil Magnético do Lucas Carlos".
`;

    console.log('🤖 Criando thread para o assistente');
    
    // Criar thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      const error = await threadResponse.text();
      console.error('❌ Erro ao criar thread:', error);
      throw new Error('Erro ao criar thread');
    }

    const thread = await threadResponse.json();
    console.log('✅ Thread criada:', thread.id);

    // Adicionar mensagem ao thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: promptParaAssistente
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('❌ Erro ao adicionar mensagem:', error);
      throw new Error('Erro ao adicionar mensagem');
    }

    console.log('✅ Mensagem adicionada ao thread');

    // Executar o assistente
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: 'asst_u7rMlg4yvT70SF0P9TsVCR3uy'
      })
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('❌ Erro ao executar assistente:', error);
      throw new Error('Erro ao executar assistente');
    }

    const run = await runResponse.json();
    console.log('🏃 Assistente executando:', run.id);

    // Aguardar conclusão
    let runStatus = run.status;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutos

    while (runStatus === 'queued' || runStatus === 'in_progress') {
      if (attempts >= maxAttempts) {
        throw new Error('Timeout: Assistente não respondeu em tempo hábil');
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!statusResponse.ok) {
        throw new Error('Erro ao verificar status da execução');
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;
      
      console.log(`⏳ Status do assistente: ${runStatus} (tentativa ${attempts})`);
    }

    if (runStatus !== 'completed') {
      console.error('❌ Assistente falhou:', runStatus);
      throw new Error(`Assistente falhou com status: ${runStatus}`);
    }

    console.log('✅ Assistente concluído');

    // Buscar resposta
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error('Erro ao buscar mensagens');
    }

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data.find((msg: any) => msg.role === 'assistant');
    
    if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
      throw new Error('Resposta do assistente não encontrada');
    }

    const planejamentoGerado = assistantMessage.content[0].text.value;
    console.log('📄 Planejamento gerado com sucesso');

    // Salvar no banco
    const { error: updateError } = await supabase
      .from('formularios_parceria')
      .update({
        planejamento_estrategico: planejamentoGerado,
        planejamento_gerado_em: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email_usuario', emailCliente);

    if (updateError) {
      console.error('❌ Erro ao salvar no banco:', updateError);
      throw updateError;
    }

    console.log('💾 Planejamento salvo no banco de dados');

    return new Response(JSON.stringify({
      success: true,
      planejamento: planejamentoGerado,
      threadId: thread.id,
      message: 'Planejamento estratégico gerado com sucesso usando assistente personalizado!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Erro na edge function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Erro ao gerar planejamento com assistente personalizado'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});