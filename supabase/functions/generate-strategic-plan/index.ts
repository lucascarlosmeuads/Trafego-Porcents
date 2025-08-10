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
    
    const { emailCliente, campos } = await req.json();
    console.log('Email do cliente:', emailCliente, '\nCampos recebidos:', campos);

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

    // Construir prompt baseado no briefing + campos de entrada
    const prompt = buildPromptLucas(briefing, campos || {});
    console.log('🧾 Preview do prompt (iniciais):', prompt.slice(0, 300));

    // Payload para OpenAI
    const openAIPayload = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é o Lucas Carlos, estrategista de tráfego. Responda em PT-BR, 1ª pessoa do plural (nós/“vamos”), tom humano, direto, comercial e assertivo, sem jargão.
REGRAS OBRIGATÓRIAS DE FORMATO:
- Inicie exatamente com: "# Planejamento Estratégico — {NOME} (Funil Interativo e Magnético)"
- Em seguida, gere APENAS as seções e títulos exatamente nesta ordem e sintaxe: 
  "Tráfego pago em troca de % sobre as vendas | Sem mensalidade" (linha em negrito),
  "## Visão rápida do projeto",
  "## O que vamos fazer (explicado de forma simples)",
  "## Esboço do Funil Interativo (como a jornada acontece)",
  "## Exemplos de copys prontas (para usar e testar)",
  "## Tráfego e metas iniciais",
  "## Custos de estrutura (pagos uma única vez)",
  "## Importante: este é um esboço",
  "## Próximos passos (práticos e rápidos)",
  "## Dados do projeto"
- Não adicione seções extras, preâmbulos, códigos ou backticks.
- Não use tom instrucional nem verbos no imperativo (p.ex.: "utilize", "crie", "apresente", "direcione", "explique", "liste", "sugira").
- Redija como decisões já tomadas e plano aprovado: use "vamos", "definimos", "já mapeamos", "direcionaremos".
- Evite tratar o leitor como "você".
- Permita e utilize a palavra "interativo" quando fizer sentido.
- Não prometa ganhos; use estimativas conservadoras.
- Inclua a nota do "pente fino" quando solicitada.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.35,
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

// Atualizar status da campanha do cliente para "Planj/Gerado"
try {
  const { error: statusError } = await supabase
    .from('todos_clientes')
    .update({ status_campanha: 'Planj/Gerado' })
    .eq('email_cliente', emailCliente);

  if (statusError) {
    console.warn('⚠️ Não foi possível atualizar status para Planj/Gerado:', statusError.message);
  } else {
    console.log('✅ Status do cliente atualizado para Planj/Gerado');
  }
} catch (e) {
  console.warn('⚠️ Erro inesperado ao atualizar status do cliente:', e);
}

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

function buildPromptLucas(briefing: any, campos: Record<string, unknown>) : string {
  const br = (s: any, fb: string) => (s !== undefined && s !== null && String(s).trim() !== '' ? String(s) : fb);
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, '0');
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const yyyy = hoje.getFullYear();
  const dataHoje = `${dd}/${mm}/${yyyy}`;

  const Cliente_Nome = br((campos as any).Cliente_Nome ?? briefing.nome_marca ?? briefing.nome_produto, '[Cliente]');
  const Projeto_Titulo = br((campos as any).Projeto_Titulo ?? briefing.nome_produto, '[Projeto]');
  const Data_De_Hoje = br((campos as any).Data_De_Hoje, dataHoje);
  const Contato_Email = br((campos as any).Contato_Email, '[Email não informado]');
  const Contato_WhatsApp = br((campos as any).Contato_WhatsApp, '[WhatsApp não informado]');
  const Produto_Servico = br((campos as any).Produto_Servico ?? briefing.nome_produto, '[Produto/Serviço]');
  const Avatar = br((campos as any).Avatar ?? briefing.publico_alvo, '[Avatar do cliente]');
  const Investimento_Diario_Sugerido = br((campos as any).Investimento_Diario_Sugerido ?? (briefing.investimento_diario ? `R$ ${briefing.investimento_diario}` : ''), '[R$ 30,00/dia]');
  const Modelo_Parceria = br((campos as any).Modelo_Parceria, '% sobre as vendas, sem mensalidade');
  const Mini_Oferta_Ativa = String((campos as any).Mini_Oferta_Ativa ?? 'false').toLowerCase() === 'true' || (campos as any).Mini_Oferta_Ativa === true;
  const Mini_Oferta_Nome = br((campos as any).Mini_Oferta_Nome, '[Nome da mini-oferta]');
  const Mini_Oferta_Preco = br((campos as any).Mini_Oferta_Preco, '[Preço]');
  const Curso_Preco_Faixa = br((campos as any).Curso_Preco_Faixa, '[R$ 297–497]');
  const Canais = br((campos as any).Canais ?? ((briefing.possui_facebook || briefing.possui_instagram) ? 'Facebook e Instagram' : ''), '[Facebook e Instagram]');
  const Notas_Extras = br((campos as any).Notas_Extras, '');

  const Nicho_Negocio = br((campos as any).Nicho_Negocio ?? briefing.nicho ?? briefing.tipo_negocio ?? briefing.segmento ?? briefing.nome_marca, '[Negócio do cliente]');
  const Objetivo_Imediato = br((campos as any).Objetivo_Imediato ?? briefing.objetivo_principal ?? briefing.objetivo, '[Objetivo resumido]');
  const Investimento_Inicial = br((campos as any).Investimento_Inicial ?? briefing.investimento_inicial, '');
  const Data_Lead = br((campos as any).Data_Lead ?? briefing.data_lead ?? briefing.created_at, dataHoje);
  const WhatsApp_Principal = br((campos as any).Contato_WhatsApp ?? briefing.whatsapp ?? briefing.telefone, Contato_WhatsApp);

  const Custo_Criativos = br((campos as any).Custo_Criativos, 'R$ 500');
  const Custo_Funil = br((campos as any).Custo_Funil, 'R$ 800');
  const Custo_BM_Track = br((campos as any).Custo_BM_Track ?? (campos as any).Custo_BM ?? (campos as any).Custo_Track, 'R$ 200');
  const Custos_Total = br((campos as any).Custos_Total, 'R$ 1.500');
  const Vendas_Anteriores = br((campos as any).Vendas_Anteriores ?? briefing.vendas_anteriores, 'não informado');
  const Ticket_Medio = br((campos as any).Ticket_Medio ?? briefing.valor_medio ?? briefing.ticket_medio, 'não informado');

  const miniOfertaLinha = Mini_Oferta_Ativa
    ? `Entrada opcional (true): incluir ${Mini_Oferta_Nome} por ${Mini_Oferta_Preco} para dar resultado imediato e ajudar a pagar o tráfego.`
    : `Entrada opcional (false): foque em qualificar muito bem o lead e conduzir direto à oferta principal.`;

  return `Gere o texto FINAL em markdown seguindo exatamente o FORMATO abaixo. Escreva em 1ª pessoa do plural (nós/“vamos”), tom humano, comercial, direto e assertivo, sem jargão. Parágrafos curtos. Não prometa ganhos. Use exemplos específicos ao nicho real do cliente. Sem tom instrucional; não use verbos no imperativo. Permita a palavra "interativo" quando fizer sentido. Se faltar dado, use [colchetes] com suposições conservadoras.

TÍTULO E SUBTÍTULO
- Título H1: # Planejamento Estratégico — ${Cliente_Nome} (Funil Interativo e Magnético)
- Sub: **Tráfego pago em troca de % sobre as vendas | Sem mensalidade**

---

## Visão rápida do projeto

- **Cliente:** ${Cliente_Nome}
- **Negócio:** ${Nicho_Negocio}
- **Objetivo imediato:** ${Objetivo_Imediato}
- ${Investimento_Inicial && String(Investimento_Inicial).trim() !== '' ? `**Investimento inicial citado:** ${Investimento_Inicial}` : ''}
- **Contatos:** ${Contato_Email} | WhatsApp: ${WhatsApp_Principal}
- **Data do lead:** ${Data_Lead}

---

## O que vamos fazer (explicado de forma simples)
Vamos validar um Funil Interativo que combina curiosidade, interação e conversão para ${Produto_Servico}, direcionado a ${Avatar} em ${Nicho_Negocio}. Esse caminho supera página fria ou contato direto porque eleva o engajamento e a qualificação antes da abordagem comercial.

---

## Esboço do Funil Interativo (como a jornada acontece)

### Anúncio — copy e ideia visual
- Vamos utilizar 1–2 variações de copy específicas ao nicho, com frase forte e benefício principal.
- Definimos ângulos visuais (3): provas sociais reais, rotina simples, benefício visual claro.
- CTA definido: "Fazer o Teste Inteligente".

### Página de entrada — mensagem e visual
- A mensagem inicial reforça o tema e o valor do teste para o lead.
- Usaremos 2–3 depoimentos e um contador sutil para reforço social.
- CTA único: Começar o Teste.

### Teste Inteligente — perguntas com lógica condicional
- Já mapeamos 5–7 perguntas segmentadoras e 3–4 lógicas que personalizam a experiência para ${Nicho_Negocio}/${Avatar}.

### Tela de resultado — entrega e urgência
- Vamos entregar um diagnóstico/resumo personalizado e um próximo passo claro (cupom, guia, grupo ou convite).
- Ações finais: direcionaremos para WhatsApp e, quando fizer sentido, Calendly/checkout.

---

## Exemplos de copys prontas (para usar e testar)
- **Anúncio (Facebook/Instagram):** variações definidas (1–2) específicas ao nicho.
- **Página (acima da dobra):** versão inicial aprovada explicando o teste e o benefício.
- **WhatsApp (mensagem inicial):** mensagem humana com tag do segmento.
> Observação: Evitamos promessas; usamos provas sociais reais sem garantir ganhos.

---

## Tráfego e metas iniciais
- **Orçamento sugerido:** ${Investimento_Diario_Sugerido}/dia para validar ângulos e público.
- **Objetivo de campanha:** Conversões (lead qualificado do teste).
- **Públicos:** interesses do nicho, lookalikes a partir dos primeiros leads, geolocal quando fizer sentido.
- **Métricas de referência:** CTR 2%–3% • CPL estimado R$ 5–10 • Conversão da página 20%–30% (estimativas para a fase de teste).

---

## Custos de estrutura (pagos uma única vez)
- **${Custo_Criativos}** — baterias de criativos (vídeo e imagem)
- **${Custo_Funil}** — montagem do funil interativo
- **${Custo_BM_Track}** — configuração da Business Manager e trackeamento
**TOTAL: ${Custos_Total} (SEM MENSALIDADE)**
Gestão de tráfego por **${Modelo_Parceria}**.

---

## Importante: este é um esboço
Aqui é a visão estratégica do caminho. Antes de subir, vamos passar o **pente fino** em cada palavra, ordem das telas, CTAs e sequência de mensagens, ajustando por **dados**, **compliance** e **voz da marca**.

---

## Próximos passos (práticos e rápidos)
**Macro (Empresarial)**
1. Aprovar o conceito de Funil Interativo para ${Nicho_Negocio}.
2. Confirmar oferta de entrada e upsell.

**Médio (Empresarial)**
3) Enviar depoimentos/imagens reais permitidos pela marca.
4) Liberar acesso à BM/Pixel e domínio.
5) Definir agenda/Calendly para perfis de liderança.

**Micro (Empresarial)**
6) Validar mensagem do WhatsApp de boas-vindas (com tags por segmento).
7) Aprovar 3 variações de criativos e 2 ângulos de copy.
8) Subir campanha de teste (${Investimento_Diario_Sugerido}/dia), monitorar 3–5 dias e otimizar.

---

## Dados do projeto
- Nome: **${Cliente_Nome}**
- Email: **${Contato_Email}**
- WhatsApp: **${WhatsApp_Principal}**
- Tipo de negócio: **${Nicho_Negocio}**
- Vendas anteriores: **${Vendas_Anteriores}**
- Valor médio do produto/serviço: **${Ticket_Medio}**

`;
}