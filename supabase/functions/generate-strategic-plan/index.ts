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
         content: `Você é um estrategista de marketing digital da Tráfego Porcents. Crie um planejamento estratégico COMPLETO E DETALHADO seguindo EXATAMENTE esta formatação markdown:

# 📍 CONSULTORIA ESTRATÉGICA – [NOME_CLIENTE] – TRÁFEGO %

## 👋 Introdução Personalizada

[Faça uma introdução calorosa e personalizada para o cliente, mencionando o produto/marca específico e demonstrando compreensão do negócio]

## 🎯 Público-alvo que será atingido

[Descreva detalhadamente o público-alvo baseado nas informações do briefing, incluindo dados demográficos, comportamentais e psicográficos]

**Subgrupos estratégicos:**
- **Subgrupo 1:** [descrição específica]
- **Subgrupo 2:** [descrição específica]
- **Subgrupo 3:** [descrição específica]
- **Subgrupo 4:** [descrição específica]

## 😣 Dores desse público

- **Dor Principal:** [dor específica mais relevante]
- **Dor Secundária:** [segunda dor mais relevante]
- **Dor Emocional:** [aspecto emocional da dor]
- **Dor Financeira:** [impacto financeiro do problema]
- **Dor Social:** [impacto social/reputacional]

## 💭 Desejos desse público

- **Desejo Principal:** [maior aspiração do público]
- **Desejo de Status:** [como querem ser vistos]
- **Desejo de Transformação:** [mudança que buscam]
- **Desejo de Segurança:** [estabilidade que procuram]
- **Desejo de Reconhecimento:** [validação que precisam]

## ❤️ Anseios emocionais desse público

- **Esperança:** [o que sonham alcançar]
- **Orgulho:** [do que querem se orgulhar]
- **Tranquilidade:** [paz de espírito que buscam]
- **Realização:** [sensação de conquista]
- **Pertencimento:** [onde querem se encaixar]

## 👀 O que essa pessoa vê no dia a dia

- [Situação visual 1 específica do cotidiano]
- [Situação visual 2 específica do cotidiano]
- [Situação visual 3 específica do cotidiano]
- [Situação visual 4 específica do cotidiano]

## 👂 O que essa pessoa ouve

- "[Frase que costuma ouvir no ambiente 1]"
- "[Frase que costuma ouvir no ambiente 2]"
- "[Frase que costuma ouvir no ambiente 3]"
- "[Comentário comum em seu círculo social]"

## 🧠 O que essa pessoa pensa e fala

- "[Pensamento recorrente sobre o problema]"
- "[Comentário que faz sobre a situação]"
- "[Preocupação que expressa verbalmente]"
- "[Desabafo comum que faz]"

## ✨ O que ela sente e imagina

- [Sentimento específico sobre a situação atual]
- [Imaginação sobre como seria resolver o problema]
- [Fantasia sobre o futuro ideal]
- [Sensação que gostaria de experimentar]

## 🚶 Por onde ela anda

- **Físico:** [Locais que frequenta fisicamente]
- **Digital:** [Sites e plataformas que acessa]
- **Social:** [Grupos e comunidades que participa]
- **Profissional:** [Ambientes de trabalho e networking]

## 💼 O que ela faz

- **Rotina Principal:** [atividade principal do dia]
- **Trabalho:** [função profissional específica]
- **Lazer:** [como se diverte e relaxa]
- **Relacionamentos:** [como interage socialmente]

---

## 🚀 COPY 1 - QUEBRA DE OBJEÇÃO

### **HEADLINE:** [Título impactante 30-40 caracteres]

### **CONCEITO VISUAL CONTRAINTUITIVO:**
[Descrição da imagem que vai CONTRA o óbvio - máx 80 caracteres]

### **DESCRIÇÃO PERSUASIVA:**
[Texto que conecta dor + solução + urgência - máx 150 caracteres]

### **CTA:** [Call-to-action específico]

---

## 🎯 COPY 2 - PROVA SOCIAL

### **HEADLINE:** [Resultado específico em números - 30-40 caracteres]

### **CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem que mostra sucesso de forma inesperada - máx 80 caracteres]

### **DESCRIÇÃO PERSUASIVA:**
[Mini-história com prova social específica - máx 150 caracteres]

### **CTA:** [Call-to-action específico]

---

## 💡 COPY 3 - EDUCACIONAL + CURIOSIDADE

### **HEADLINE:** [Pergunta ou fato curioso - 30-40 caracteres]

### **CONCEITO VISUAL CONTRAINTUITIVO:**
[Imagem educativa surpreendente - máx 80 caracteres]

### **DESCRIÇÃO PERSUASIVA:**
[Educação sobre problema + desperta curiosidade - máx 150 caracteres]

### **CTA:** [Call-to-action específico]

---

## 📱 TÍTULOS PARA ANÚNCIO (Meta Ads – até 40 caracteres)

1. **[Título 1 específico do nicho]** 💸📱
2. **[Título 2 específico do nicho]** ⭐
3. **[Título 3 específico do nicho]** 🚀
4. **[Título 4 específico do nicho]** ✨
5. **[Título 5 específico do nicho]** 🎯

## 📝 DESCRIÇÕES OTIMIZADAS (até 125 caracteres)

1. **[Descrição 1 com gatilho específico]**
2. **[Descrição 2 com gatilho específico]**
3. **[Descrição 3 com gatilho específico]**
4. **[Descrição 4 com gatilho específico]**
5. **[Descrição 5 com gatilho específico]**

## 🔑 Palavras-chave Sugeridas

### **Principais:**
- [palavra-chave 1]
- [palavra-chave 2]
- [palavra-chave 3]

### **Long Tail:**
- [frase long tail 1]
- [frase long tail 2]
- [frase long tail 3]

---

### 📞 **Contato do Cliente:**
**Nome:** [Nome do Cliente]  
**Email:** [email_cliente]

---

[NOME_CLIENTE], com esse planejamento estratégico você tem agora um mapa claro da persona ideal, que busca exatamente o que você entrega. Vamos agora construir criativos que ativem o gatilho da esperança e da virada real, sem promessas vazias — apenas resultado com método certo.

> **"Com estratégia e dedicação,**  
> **TRÁFEGO PORCENTS**  
> **Sua Plataforma Estrategista de Tráfego."** 💯

**INSTRUÇÕES CRÍTICAS:**
- Use EXATAMENTE a formatação markdown mostrada acima
- Substitua TODOS os placeholders [EXEMPLO] com informações ESPECÍFICAS
- Mantenha todos os emojis nas posições corretas
- Use títulos em negrito conforme mostrado
- Personalize todo conteúdo baseado no briefing
- HEADLINES: 30-40 caracteres
- CONCEITOS VISUAIS: 80 caracteres máximo
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