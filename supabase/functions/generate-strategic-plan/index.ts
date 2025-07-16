import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Iniciando geração de planejamento estratégico ===');
    
    const { emailCliente } = await req.json();
    console.log('Email do cliente:', emailCliente);

    // Verificar API Key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey || !openAIApiKey.startsWith('sk-')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API Key da OpenAI não configurada corretamente.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do briefing do cliente
    const { data: briefing, error: briefingError } = await supabase
      .from('briefings_cliente')
      .select('*')
      .eq('email_cliente', emailCliente)
      .single();

    if (briefingError || !briefing) {
      console.error('Erro ao buscar briefing:', briefingError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Briefing do cliente não encontrado.' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construir prompt baseado nos dados do briefing
    const prompt = buildPromptFromBriefing(briefing);

    // Payload para OpenAI
    const openAIPayload = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um copywriter especialista da Tráfego Porcents que cria copies de alta conversão para campanhas de marketing digital. Crie EXATAMENTE 3 copies estruturadas e prontas para geração de imagens.

FORMATO OBRIGATÓRIO - SIGA EXATAMENTE:

📍 PLANEJAMENTO ESTRATÉGICO CRIATIVO – ${briefing.nome_marca || briefing.nome_produto || 'CLIENTE'} – TRÁFEGO %

**Introdução personalizada:**
Olá ${briefing.nome_marca || briefing.nome_produto || 'cliente'},
Baseado no seu briefing, criamos 3 copies estratégicas prontas para transformar em criativos visuais de alta conversão para ${briefing.publico_alvo || 'seu público'}.

---

## 🚀 COPY 1 - QUEBRA DE OBJEÇÃO

**HEADLINE:** [Título impactante de 30-40 caracteres que quebra a principal objeção do ${briefing.publico_alvo || 'público'}]

**CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem específica CONTRA o óbvio sobre ${briefing.nome_produto}: Ex: se for curso de vendas, mostre pessoa descansando enquanto vendas acontecem automaticamente, NÃO pessoa trabalhando duro. Máx 80 caracteres]

**DESCRIÇÃO PERSUASIVA:**
[Conecte a dor específica do ${briefing.publico_alvo || 'público'} com a solução ${briefing.nome_produto}, use gatilho de escassez/urgência. Máx 150 caracteres]

**CTA:** [Action específico para ${briefing.nome_produto}]

---

## 🎯 COPY 2 - PROVA SOCIAL

**HEADLINE:** [Resultado específico em números ou depoimento. 30-40 caracteres]

**CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem que mostra sucesso/resultado de forma inesperada para ${briefing.tipo_prestacao_servico || 'o serviço'}. Máx 80 caracteres]

**DESCRIÇÃO PERSUASIVA:**
[Mini-story com prova social específica do nicho ${briefing.direcionamento_campanha || 'negócio'}, gere confiança. Máx 150 caracteres]

**CTA:** [Action específico para ${briefing.nome_produto}]

---

## 💡 COPY 3 - EDUCACIONAL + CURIOSIDADE

**HEADLINE:** [Pergunta ou fato curioso sobre ${briefing.diferencial || 'o nicho'}. 30-40 caracteres]

**CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem educativa que ensina algo de forma visual surpreendente sobre ${briefing.nome_produto}. Máx 80 caracteres]

**DESCRIÇÃO PERSUASIVA:**
[Eduque sobre problema do ${briefing.publico_alvo || 'público'} + desperte curiosidade para solução. Máx 150 caracteres]

**CTA:** [Action específico para ${briefing.nome_produto}]

---

## 🎨 Diretrizes Visuais
- Cores: ${briefing.cores_desejadas || 'Cores profissionais que transmitem confiança'}
- Estilo: ${briefing.estilo_visual || 'Moderno e profissional'}
- Tom: ${briefing.publico_alvo ? `Adequado para ${briefing.publico_alvo}` : 'Profissional e confiável'}

---

> "Copies estratégicas para máxima conversão,  
> Equipe Tráfego Porcents."

REGRAS CRÍTICAS:
- HEADLINES: 30-40 caracteres (legíveis no mobile)
- CONCEITOS VISUAIS: 80 caracteres, SEMPRE contraintuitivos  
- DESCRIÇÕES: 150 caracteres, com gatilhos mentais
- Seja ESPECÍFICO sobre ${briefing.nome_produto} e ${briefing.publico_alvo}
- Use dados reais do briefing fornecido`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    };

    // Fazer chamada para OpenAI com retry
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries + 1} para OpenAI...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(openAIPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) break;
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
      } catch (error) {
        retryCount++;
        if (retryCount > maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
      }
    }

    const data = await response.json();
    const planejamento = data.choices[0].message.content;

    if (!planejamento || planejamento.trim().length === 0) {
      throw new Error('Planejamento vazio retornado pela OpenAI');
    }

    console.log('💾 Salvando planejamento no banco de dados...');

    // Salvar planejamento na tabela briefings_cliente
    const { data: updateData, error } = await supabase
      .from('briefings_cliente')
      .update({ 
        planejamento_estrategico: planejamento,
        updated_at: new Date().toISOString()
      })
      .eq('email_cliente', emailCliente)
      .select();

    if (error) {
      console.error('❌ Erro ao salvar no banco:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Planejamento salvo com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        planejamento: planejamento
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating strategic plan:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

function buildPromptFromBriefing(briefing: any): string {
  const nomeCliente = briefing.nome_marca || briefing.nome_produto || 'Cliente';
  
  let prompt = `INFORMAÇÕES DO CLIENTE PARA PLANEJAMENTO ESTRATÉGICO:

NOME DO CLIENTE/EMPRESA: ${nomeCliente}
PRODUTO/SERVIÇO: ${briefing.nome_produto || 'Não informado'}

DETALHES DO NEGÓCIO:
- Descrição resumida: ${briefing.descricao_resumida || 'Não informado'}
- Público-alvo: ${briefing.publico_alvo || 'Não informado'}
- Diferencial: ${briefing.diferencial || 'Não informado'}
- Investimento diário: ${briefing.investimento_diario ? `R$ ${briefing.investimento_diario}` : 'Não informado'}
- Direcionamento da campanha: ${briefing.direcionamento_campanha || 'Não informado'}
- Abrangência do atendimento: ${briefing.abrangencia_atendimento || 'Não informado'}
- Localização para divulgação: ${briefing.localizacao_divulgacao || 'Não informado'}
- Tipo de prestação de serviço: ${briefing.tipo_prestacao_servico || 'Não informado'}
- Forma de pagamento: ${briefing.forma_pagamento || 'Não informado'}

CARACTERÍSTICAS CRIATIVAS:
- Estilo visual: ${briefing.estilo_visual || 'Não informado'}
- Cores desejadas: ${briefing.cores_desejadas || 'Não informado'}
- Cores proibidas: ${briefing.cores_proibidas || 'Não informado'}
- Tipo de fonte: ${briefing.tipo_fonte || 'Não informado'}
- Fonte específica: ${briefing.fonte_especifica || 'Não informado'}
- Tipos de imagens preferidas: ${briefing.tipos_imagens_preferidas ? briefing.tipos_imagens_preferidas.join(', ') : 'Não informado'}

RECURSOS DISPONÍVEIS:
- Possui Facebook: ${briefing.possui_facebook ? 'Sim' : 'Não'}
- Possui Instagram: ${briefing.possui_instagram ? 'Sim' : 'Não'}
- Utiliza WhatsApp Business: ${briefing.utiliza_whatsapp_business ? 'Sim' : 'Não'}
- Criativos prontos: ${briefing.criativos_prontos ? 'Sim' : 'Não'}
- Vídeos prontos: ${briefing.videos_prontos ? 'Sim' : 'Não'}
- Quer site: ${briefing.quer_site ? 'Sim' : 'Não'}

OBSERVAÇÕES FINAIS:
${briefing.observacoes_finais || 'Nenhuma observação adicional'}

INSTRUÇÕES ESPECÍFICAS:
- Use o nome "${nomeCliente}" no título e ao longo do texto
- Baseie a persona no público-alvo e tipo de negócio informados
- Crie títulos e descrições específicos para o nicho identificado
- Seja específico sobre o público (ex: "mães que trabalham home office" ao invés de "mulheres")
- Use dados concretos quando fornecidos

OBJETIVO: Criar um mapeamento completo da persona ideal para este negócio.`;

  return prompt;
}