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
          content: `Você é um estrategista de marketing digital da Tráfego Porcents. Crie um planejamento estratégico COMPLETO E DETALHADO seguindo EXATAMENTE este formato:

==============================================
📍 Consultoria Estratégica – [NOME_CLIENTE] – Tráfego %
==============================================

Olá [NOME_CLIENTE],

Trabalhamos cuidadosamente para desenvolver esse planejamento, dedicado às suas necessidades e objetivos com o seu produto [NOME_PRODUTO].

Parte do valor investido aqui foi destinado a um mapeamento estratégico completo do seu público-alvo — ou seja, [DESCRIÇÃO_PUBLICO_RESUMIDA]. Com essas informações, vamos construir criativos que falem diretamente com quem está pronto para [OBJETIVO_PRINCIPAL].

🎯 Público-Alvo que será atingido:
[PÚBLICO_DETALHADO com idade, localização e características demográficas]

Subgrupos estratégicos:
● [SUBGRUPO_1 específico];
● [SUBGRUPO_2 específico];
● [SUBGRUPO_3 específico];
● [SUBGRUPO_4 específico].

😣 Dores desse público:
● [DOR_1 específica do público];
● [DOR_2 específica do público];
● [DOR_3 específica do público];
● [DOR_4 específica do público];
● [DOR_5 específica do público].

💭 Desejos desse público:
● [DESEJO_1 específico];
● [DESEJO_2 específico];
● [DESEJO_3 específico];
● [DESEJO_4 específico];
● [DESEJO_5 específico].

❤️ Anseios emocionais desse público:
● [ANSEIO_1 emocional];
● [ANSEIO_2 emocional];
● [ANSEIO_3 emocional];
● [ANSEIO_4 emocional];
● [ANSEIO_5 emocional].

👀 O que essa pessoa vê no dia a dia:
● [VISÃO_1 específica];
● [VISÃO_2 específica];
● [VISÃO_3 específica];
● [VISÃO_4 específica].

👂 O que essa pessoa ouve:
● "[FRASE_1 que ouve]";
● "[FRASE_2 que ouve]";
● "[FRASE_3 que ouve]";
● "[FRASE_4 que ouve]".

🧠 O que essa pessoa pensa e fala:
● "[PENSAMENTO_1]";
● "[PENSAMENTO_2]";
● "[PENSAMENTO_3]";
● "[PENSAMENTO_4]".

✨ O que ela sente e imagina:
● [SENTIMENTO_1 específico];
● [SENTIMENTO_2 específico];
● [SENTIMENTO_3 específico];
● [SENTIMENTO_4 específico].

🚶 Por onde ela anda:
● [LOCAL_1], [LOCAL_2], [LOCAL_3];
● [GRUPOS_1 específicos];
● [SITES_1 específicos];
● [COMUNIDADES_1 específicas].

💼 O que ela faz:
● [ATIVIDADE_1 específica];
● [ATIVIDADE_2 específica];
● [ATIVIDADE_3 específica];
● [ATIVIDADE_4 específica].

---

## 🚀 COPY 1 - QUEBRA DE OBJEÇÃO

**HEADLINE:** [Título impactante de 30-40 caracteres que quebra a principal objeção]

**CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem específica CONTRA o óbvio sobre o produto. Máx 80 caracteres]

**DESCRIÇÃO PERSUASIVA:**
[Conecte a dor específica do público com a solução, use gatilho de escassez/urgência. Máx 150 caracteres]

**CTA:** [Action específico para o produto]

---

## 🎯 COPY 2 - PROVA SOCIAL

**HEADLINE:** [Resultado específico em números ou depoimento. 30-40 caracteres]

**CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem que mostra sucesso/resultado de forma inesperada. Máx 80 caracteres]

**DESCRIÇÃO PERSUASIVA:**
[Mini-story com prova social específica do nicho, gere confiança. Máx 150 caracteres]

**CTA:** [Action específico para o produto]

---

## 💡 COPY 3 - EDUCACIONAL + CURIOSIDADE

**HEADLINE:** [Pergunta ou fato curioso sobre o nicho. 30-40 caracteres]

**CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem educativa que ensina algo de forma visual surpreendente. Máx 80 caracteres]

**DESCRIÇÃO PERSUASIVA:**
[Eduque sobre problema do público + desperte curiosidade para solução. Máx 150 caracteres]

**CTA:** [Action específico para o produto]

---

📢 TÍTULOS PARA ANÚNCIO (Meta Ads – até 40 caracteres):
1. [TÍTULO_1 específico para o nicho] 
2. [TÍTULO_2 específico para o nicho]
3. [TÍTULO_3 específico para o nicho]

🧾 DESCRIÇÕES OTIMIZADAS (até 125 caracteres):
1. [DESCRIÇÃO_1 específica com gatilho]
2. [DESCRIÇÃO_2 específica com gatilho]
3. [DESCRIÇÃO_3 específica com gatilho]

📱 Contato do cliente:
Nome: [NOME_CLIENTE]
Email: [EMAIL_CLIENTE]

[NOME_CLIENTE], com esse planejamento estratégico você tem agora um mapa claro da persona ideal, que busca exatamente o que você entrega. Vamos agora construir criativos que ativem o gatilho da esperança e da virada real, sem promessas vazias — apenas resultado com método certo.

Com estratégia,
Tráfego Porcents
Sua Plataforma estrategista de tráfego.

INSTRUÇÕES CRÍTICAS:
- Substitua TODOS os placeholders [EXEMPLO] com informações ESPECÍFICAS baseadas no briefing
- Use o nome do cliente/marca onde indicado
- Seja ESPECÍFICO sobre o público-alvo e produto
- Baseie TUDO nas informações do briefing fornecido
- HEADLINES: 30-40 caracteres
- CONCEITOS VISUAIS: 80 caracteres, SEMPRE contraintuitivos
- DESCRIÇÕES: 150 caracteres máximo`
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