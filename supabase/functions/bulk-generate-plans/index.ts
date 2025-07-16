import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Iniciando geração em massa de planejamentos ===');
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar todos os briefings sem planejamento
    const { data: briefings, error: fetchError } = await supabaseClient
      .from('briefings_cliente')
      .select('email_cliente, nome_produto')
      .eq('formulario_completo', true)
      .is('planejamento_estrategico', null);

    if (fetchError) {
      console.error('Erro ao buscar briefings:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Encontrados ${briefings?.length || 0} briefings para processar`);

    let sucessos = 0;
    let erros = 0;
    const detalhes = [];

    // Processar cada briefing
    for (const briefing of briefings || []) {
      try {
        console.log(`🔄 Processando: ${briefing.email_cliente} - ${briefing.nome_produto}`);
        
        // Buscar dados completos do briefing
        const { data: briefingCompleto, error: briefingError } = await supabaseClient
          .from('briefings_cliente')
          .select('*')
          .eq('email_cliente', briefing.email_cliente)
          .single();

        if (briefingError) {
          console.error(`Erro ao buscar briefing completo para ${briefing.email_cliente}:`, briefingError);
          erros++;
          detalhes.push({ email: briefing.email_cliente, status: 'erro', erro: briefingError.message });
          continue;
        }

        // Gerar prompt
        const prompt = buildPromptFromBriefing(briefingCompleto);
        
        // Chamar OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'Você é um especialista em marketing digital e planejamento estratégico. Sua função é criar um planejamento estratégico completo e detalhado baseado nas informações do briefing do cliente.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.7
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`Erro OpenAI: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const planejamento = openaiData.choices[0].message.content;

        // Salvar o planejamento
        const { error: updateError } = await supabaseClient
          .from('briefings_cliente')
          .update({ planejamento_estrategico: planejamento })
          .eq('email_cliente', briefing.email_cliente);

        if (updateError) {
          console.error(`Erro ao salvar planejamento para ${briefing.email_cliente}:`, updateError);
          erros++;
          detalhes.push({ email: briefing.email_cliente, status: 'erro', erro: updateError.message });
        } else {
          console.log(`✅ Planejamento gerado para: ${briefing.email_cliente}`);
          sucessos++;
          detalhes.push({ email: briefing.email_cliente, status: 'sucesso' });
        }

        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Erro ao processar ${briefing.email_cliente}:`, error);
        erros++;
        detalhes.push({ email: briefing.email_cliente, status: 'erro', erro: error.message });
      }
    }

    console.log(`📊 Processamento concluído: ${sucessos} sucessos, ${erros} erros`);

    return new Response(JSON.stringify({
      success: true,
      total: briefings?.length || 0,
      sucessos,
      erros,
      detalhes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na geração em massa:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildPromptFromBriefing(briefing: any): string {
  return `
Por favor, crie um PLANEJAMENTO ESTRATÉGICO COMPLETO E DETALHADO para a seguinte empresa/produto:

=== INFORMAÇÕES DO CLIENTE ===
Marca/Produto: ${briefing.nome_marca || briefing.nome_produto || 'Não informado'}
Descrição: ${briefing.descricao_resumida || 'Não informado'}
Diferencial: ${briefing.diferencial || 'Não informado'}
Público-alvo: ${briefing.publico_alvo || 'Não informado'}
Investimento diário: R$ ${briefing.investimento_diario || 'Não informado'}

=== INFORMAÇÕES TÉCNICAS ===
Direcionamento da campanha: ${briefing.direcionamento_campanha || 'Não informado'}
Localização para divulgação: ${briefing.localizacao_divulgacao || 'Não informado'}
Abrangência do atendimento: ${briefing.abrangencia_atendimento || 'Não informado'}
Tipo de prestação de serviço: ${briefing.tipo_prestacao_servico || 'Não informado'}

=== CARACTERÍSTICAS CRIATIVAS ===
Estilo visual: ${briefing.estilo_visual || 'Não informado'}
Cores desejadas: ${briefing.cores_desejadas || 'Não informado'}
Cores proibidas: ${briefing.cores_proibidas || 'Não informado'}
Tipo de fonte: ${briefing.tipo_fonte || 'Não informado'}
Fonte específica: ${briefing.fonte_especifica || 'Não informado'}
Tipos de imagens preferidas: ${briefing.tipos_imagens_preferidas?.join(', ') || 'Não informado'}

=== RECURSOS DISPONÍVEIS ===
Possui Facebook: ${briefing.possui_facebook ? 'Sim' : 'Não'}
Possui Instagram: ${briefing.possui_instagram ? 'Sim' : 'Não'}
Utiliza WhatsApp Business: ${briefing.utiliza_whatsapp_business ? 'Sim' : 'Não'}
Criativos prontos: ${briefing.criativos_prontos ? 'Sim' : 'Não'}
Vídeos prontos: ${briefing.videos_prontos ? 'Sim' : 'Não'}
Quer site: ${briefing.quer_site ? 'Sim' : 'Não'}

=== OUTRAS INFORMAÇÕES ===
Forma de pagamento: ${briefing.forma_pagamento || 'Não informado'}
Observações finais: ${briefing.observacoes_finais || 'Não informado'}
Resumo conversa vendedor: ${briefing.resumo_conversa_vendedor || 'Não informado'}

=== INSTRUÇÕES PARA O PLANEJAMENTO ===

Crie um planejamento estratégico COMPLETO E DETALHADO que inclua:

1. **ANÁLISE DE MERCADO E POSICIONAMENTO**
2. **ESTRATÉGIA DE PÚBLICO-ALVO**
3. **ESTRATÉGIA DE CANAIS E PLATAFORMAS**
4. **ESTRATÉGIA DE CONTEÚDO**
5. **ESTRATÉGIA DE CAMPANHAS PAGAS**
6. **CRONOGRAMA DE IMPLEMENTAÇÃO**
7. **MÉTRICAS E KPIs**
8. **ORÇAMENTO E DISTRIBUIÇÃO**
9. **ESTRATÉGIAS DE CONVERSÃO**
10. **PLANO DE CONTINGÊNCIA**

Para cada seção, forneça informações específicas, detalhadas e actionáveis baseadas nas informações fornecidas.

O planejamento deve ser PRÁTICO, ESPECÍFICO e pronto para implementação.
`;
}