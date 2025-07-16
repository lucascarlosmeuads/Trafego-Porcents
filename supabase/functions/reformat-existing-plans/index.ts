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
    console.log('=== Iniciando reformatação de todos os planejamentos existentes ===');
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar todos os briefings que JÁ TÊM planejamento
    const { data: briefings, error: fetchError } = await supabaseClient
      .from('briefings_cliente')
      .select('email_cliente, nome_produto, nome_marca, planejamento_estrategico')
      .eq('formulario_completo', true)
      .not('planejamento_estrategico', 'is', null);

    if (fetchError) {
      console.error('Erro ao buscar briefings:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Encontrados ${briefings?.length || 0} planejamentos para reformatar`);

    let sucessos = 0;
    let erros = 0;
    const detalhes = [];

    // Processar cada briefing
    for (const briefing of briefings || []) {
      try {
        console.log(`🔄 Reformatando: ${briefing.email_cliente} - ${briefing.nome_produto || briefing.nome_marca}`);
        
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

        // Criar prompt para reformatar baseado no planejamento existente
        const promptReformat = buildReformatPrompt(briefingCompleto);
        
        // Chamar OpenAI para reformatar
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
                content: `Você é um especialista em formatação de documentos estratégicos. Sua tarefa é pegar um planejamento estratégico existente e reformatá-lo seguindo EXATAMENTE esta nova formatação markdown profissional:

# 📍 CONSULTORIA ESTRATÉGICA – [NOME_CLIENTE] – TRÁFEGO %

## 👋 Introdução Personalizada

[Introdução calorosa e personalizada baseada no conteúdo existente]

## 🎯 Público-alvo que será atingido

[Público-alvo detalhado baseado no conteúdo existente]

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

INSTRUÇÕES CRÍTICAS:
- Mantenha TODO o conteúdo estratégico do planejamento original
- Use EXATAMENTE a formatação markdown mostrada acima
- Distribua o conteúdo existente nas seções apropriadas
- Mantenha todos os emojis nas posições corretas
- Use títulos em negrito conforme mostrado
- Preserve todas as informações valiosas do documento original
- Se alguma seção não existir no original, crie baseado no contexto do briefing`
              },
              {
                role: 'user',
                content: promptReformat
              }
            ],
            max_tokens: 4000,
            temperature: 0.3
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`Erro OpenAI: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const planejamentoReformatado = openaiData.choices[0].message.content;

        // Salvar o planejamento reformatado
        const { error: updateError } = await supabaseClient
          .from('briefings_cliente')
          .update({ 
            planejamento_estrategico: planejamentoReformatado,
            updated_at: new Date().toISOString()
          })
          .eq('email_cliente', briefing.email_cliente);

        if (updateError) {
          console.error(`Erro ao salvar planejamento reformatado para ${briefing.email_cliente}:`, updateError);
          erros++;
          detalhes.push({ email: briefing.email_cliente, status: 'erro', erro: updateError.message });
        } else {
          console.log(`✅ Planejamento reformatado para: ${briefing.email_cliente}`);
          sucessos++;
          detalhes.push({ email: briefing.email_cliente, status: 'sucesso' });
        }

        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error) {
        console.error(`Erro ao reformatar ${briefing.email_cliente}:`, error);
        erros++;
        detalhes.push({ email: briefing.email_cliente, status: 'erro', erro: error.message });
      }
    }

    console.log(`📊 Reformatação concluída: ${sucessos} sucessos, ${erros} erros`);

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
    console.error('Erro na reformatação em massa:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildReformatPrompt(briefing: any): string {
  const nomeCliente = briefing.nome_marca || briefing.nome_produto || 'Cliente';
  
  return `
REFORMATE este planejamento estratégico existente seguindo a nova formatação solicitada:

=== DADOS DO CLIENTE ===
Nome: ${nomeCliente}
Email: ${briefing.email_cliente}
Produto/Marca: ${briefing.nome_produto || briefing.nome_marca || 'Não informado'}
Público-alvo: ${briefing.publico_alvo || 'Não informado'}
Diferencial: ${briefing.diferencial || 'Não informado'}
Investimento diário: R$ ${briefing.investimento_diario || 'Não informado'}

=== PLANEJAMENTO ESTRATÉGICO ATUAL ===
${briefing.planejamento_estrategico}

=== INSTRUÇÕES PARA REFORMATAÇÃO ===
1. Mantenha TODO o conteúdo estratégico original
2. Redistribua as informações nas novas seções com emojis
3. Melhore a formatação usando markdown
4. Adicione títulos em negrito maiores
5. Use a estrutura hierárquica com ## e ###
6. Preserve todas as informações valiosas
7. Se necessário, complemente seções baseado nos dados do briefing
8. Use o nome "${nomeCliente}" consistentemente
9. Mantenha o tom profissional e estratégico

O objetivo é manter o mesmo conteúdo, mas com formatação muito mais profissional e visual.
  `;
}