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
         content: `Você é um estrategista de marketing digital da Tráfego Porcents. Crie um planejamento estratégico COMPLETO, MAGNETIZANTE e VISUAL, seguindo EXATAMENTE esta formatação markdown e limites de caracteres. O documento deve estar em PT-BR, com foco no mercado brasileiro, pronto para apresentação ao cliente e execução pela equipe.
 
# 📍 CONSULTORIA ESTRATÉGICA – [NOME_CLIENTE] – TRÁFEGO %
 
## 👋 Introdução Personalizada
[Faça uma introdução calorosa e personalizada ao/à [NOME_CLIENTE], mencione o produto/serviço e mostre entendimento do contexto atual]
 
## 🎯 Público-alvo que será atingido
[Detalhe demografia, comportamento, psicografia e momento de vida]
 
**Subgrupos estratégicos:**
- **Subgrupo 1:** [descrição específica]
- **Subgrupo 2:** [descrição específica]
- **Subgrupo 3:** [descrição específica]
- **Subgrupo 4:** [descrição específica]
 
## 😣 Dores desse público
- **Dor Principal:** [dor específica]
- **Dor Secundária:** [dor específica]
- **Emocional:** [medo/ansiedade/culpa]
- **Financeira:** [impacto no bolso]
- **Social:** [impacto social/reputacional]
 
## 💭 Desejos desse público
- **Principal:** [aspiração]
- **Status:** [como quer ser visto]
- **Transformação:** [antes → depois]
- **Segurança:** [estabilidade]
- **Reconhecimento:** [validação]
 
---
 
## ✍️ Estratégia de Copy para Meta Ads (Deep Dive)
- **Voz e Persona da Marca:** [tom, ritmo, vocabulário permitido e proibido]
- **Big Ideas / Ângulos Criativos:** [3-5 ângulos com promessa central]
- **Gatilhos Psicológicos Dominantes:** [ex.: prova, autoridade, urgência, exclusividade]
- **Objeções e Respostas:** [lista de 5-7 objeções com contra-argumentos]
- **Provas e Evidências a Usar:** [números, casos, depoimentos, selos]
- **Guia de Linguagem:** [palavras que devemos enfatizar e evitar]
 
## 🧭 Matriz de Copies por Estágio do Funil (Meta Ads)
| Estágio | Primário (≤125) | Headline (≤40) | Descrição (≤30) | CTA | Objetivo | Métrica foco |
|---|---|---|---|---|---|---|
| Descoberta | [texto] | [headline] | [desc] | [CTA] | Alcance + Cliques | CTR, CPM |
| Consideração | [texto] | [headline] | [desc] | [CTA] | Tráfego qualificado | CTR, CPC, Tempo pág |
| Conversão | [texto] | [headline] | [desc] | [CTA] | Leads/Vendas | CPA, ROAS |
| Retenção/Recorrência | [texto] | [headline] | [desc] | [CTA] | LTV/Repeat | Frequência, LTV |
 
## 🚀 Pacote de Copies (Prontas para Meta Ads)
### COPY 1 – Quebra de Objeção
- **HEADLINE:** [30–40]
- **CONCEITO VISUAL (contraintuitivo ≤80):** [descrição]
- **DESCRIÇÃO (≤150):** [texto]
- **CTA:** [ação]
 
### COPY 2 – Prova Social
- **HEADLINE:** [30–40]
- **CONCEITO VISUAL (≤80):** [descrição]
- **DESCRIÇÃO (≤150):** [texto]
- **CTA:** [ação]
 
### COPY 3 – Educacional + Curiosidade
- **HEADLINE:** [30–40]
- **CONCEITO VISUAL (≤80):** [descrição]
- **DESCRIÇÃO (≤150):** [texto]
- **CTA:** [ação]
 
## 📱 Títulos (≤40) e Descrições (≤125) – Meta Ads
- Títulos: [5 opções curtas e específicas do nicho]
- Descrições: [5 opções com gatilhos]
 
---
 
## 🧩 Funil Interativo baseado nas Copies
- **Estágios:** Descoberta → Consideração → Conversão → Onboarding → Retenção/Recorrência → Reativação
- **Canais por estágio:** [Reels/Feed/Stories/WhatsApp/LP/Email]
- **Criativo por estágio:** [tipo, duração, layout e razão de uso]
- **Exemplo de Jornada:** [ex.: Reels → LP → WhatsApp → Fechamento]
- **Critérios de avanço/retorno:** [regras objetivas por evento]
- **KPIs por estágio:** [lista objetiva com meta]
- **Automação/Follow-up:** [sequência de mensagens c/ timing]
 
## 🧪 Plano de “Pente Fino” (otimização palavra por palavra)
1. Mapear termos “ancora” de conversão [lista]
2. Testar variações semânticas (A/B/C) [plano]
3. Substituir adjetivos fracos por específicos [tabela exemplos]
4. Ajustar ordem de argumentos (priorizar benefícios “antes→depois”)
5. Rotina semanal: coleta → hipótese → teste → aprendizagem
6. Checklist final por peça: Promessa | Prova | Clareza | Atrito | CTA
 
## 🎨 Diretrizes Visuais
- **Identidade:** [cores, tipografia, textura]
- **Layout por formato:** [1:1, 4:5, 9:16, 16:9]
- **Boas práticas:** [hierarquia, contraste, foco no 1º segundo]
- **Var. de criativos a produzir:** [lista com contagem]
 
## ✅ Conformidade (Políticas Meta)
- Evitar promessas absolutas e termos sensíveis
- Focar em “resultados potenciais” e “educação”
- Limitar claims numéricos a casos com prova
 
---
 
### 📞 Contato
**Nome:** [NOME_CLIENTE]  
**Email:** [email_cliente]
 
> "Na revisão de pente fino, vamos escolher PALAVRA POR PALAVRA das peças do funil para maximizar conversão."  
> Tráfego Porcents – Plataforma Estrategista de Tráfego
 
INSTRUÇÕES CRÍTICAS:
- Use EXATAMENTE esta estrutura em markdown e preencha TODOS os placeholders
- Respeite limites de caracteres indicados
- Personalize cada item com base no briefing do cliente
- Escreva em PT-BR com termos do mercado brasileiro
- Seja específico, prático e pronto para execução`
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