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

    // Payload para OpenAI
    const openAIPayload = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é o Lucas Carlos, estrategista de tráfego. Gere um documento curto (400–700 palavras), em 1ª pessoa (eu), PT-BR, com voz direta e motivadora, sem jargão. Siga exatamente a estrutura solicitada, detalhe mais "A Grande Ideia" e mantenha as demais seções objetivas em bullets. Use datas absolutas, não prometa resultados, use faixas/estimativas. Inclua a frase: "Eu mesmo vou escolher cada palavra do funil e dos anúncios — nada genérico. A copy é feita para vender e educar com leveza."`
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

  const miniOfertaLinha = Mini_Oferta_Ativa
    ? `Entrada opcional (true): incluir ${Mini_Oferta_Nome} por ${Mini_Oferta_Preco} para dar resultado imediato e ajudar a pagar o tráfego.`
    : `Entrada opcional (false): foque em qualificar muito bem o lead e conduzir direto à oferta principal.`;

  return `Gere o texto FINAL em markdown seguindo exatamente as regras abaixo. Escreva em 1ª pessoa (eu, Lucas), tom direto e motivador, sem jargão. 400–700 palavras. Nada de apêndice técnico. Parágrafos curtos. Se faltar dado, use [colchetes] com suposições conservadoras.

DADOS DE CONTEXTO
- Cliente: ${Cliente_Nome}
- Projeto: ${Projeto_Titulo}
- Data: ${Data_De_Hoje}
- Contato: ${Contato_Email} · WhatsApp: ${Contato_WhatsApp}
- Produto/Serviço: ${Produto_Servico}
- Avatar: ${Avatar}
- Canais: ${Canais}
- Investimento diário sugerido: ${Investimento_Diario_Sugerido}
- Modelo de parceria: ${Modelo_Parceria}
- Curso preço faixa: ${Curso_Preco_Faixa}
- Mini_Oferta_Ativa: ${Mini_Oferta_Ativa}
- Mini_Oferta_Nome: ${Mini_Oferta_Nome}
- Mini_Oferta_Preco: ${Mini_Oferta_Preco}
- Notas extras: ${Notas_Extras}

FORMATO DE SAÍDA (sem alterar a ordem):

Título

PLANEJAMENTO ESTRATÉGICO — ${Cliente_Nome} (Funil Interativo & Magnético)

> Cliente: ${Cliente_Nome}
> Projeto: ${Projeto_Titulo}
> Data: ${Data_De_Hoje}
> Contato: ${Contato_Email} • WhatsApp: ${Contato_WhatsApp}
> Modelo: ${Modelo_Parceria}

---

1) A Grande Ideia (o coração da estratégia)
- Nome interno da ideia: crie um nome memorável.
- Tagline (1 linha): promessa simples e concreta.
- Explicação (5–8 linhas, leiga): o que é; por que funciona; por que levou alguns dias; o que muda para o cliente.
- Frase obrigatória: Eu mesmo vou escolher cada palavra do funil e dos anúncios — nada genérico. A copy é feita para vender e educar com leveza.

2) O que eu vou fazer (até 7 dias corridos)
- Publicar o diagnóstico interativo (etapas curtas e claras).
- Construir página de entrada e tela de resultado.
- Produzir criativos (3 vídeos 15–30s + 3 imagens) focados em conversão.
- Configurar campanhas (${Canais}) e sequência de WhatsApp.
- Entregar relatório D+7 com aprendizados e próximos testes.

3) Como o funil vai funcionar (sem jargão)
Anúncio → Página → Diagnóstico (3 min) → Resultado com plano prático → [Entrada opcional] → Oferta principal → Acompanhamento WhatsApp.
- ${miniOfertaLinha}

4) Investimentos e modelo
- Setup único: Criativos R$ 500 • Funil R$ 800 • BM/trackeamento R$ 200.
- Mídia: ${Investimento_Diario_Sugerido}/dia (ajustável).
- Remuneração: ${Modelo_Parceria}.
> Observação: Mídia é paga direto à plataforma. Setup ativa o projeto.

5) Prazos e próximos passos
- D+0 a D+7: construir e publicar tudo.
- D+8 a D+14: otimizações rápidas conforme os primeiros números.
Para iniciar agora: 1) OK no planejamento • 2) Enviar acesso à BM • 3) Pagamento do setup.

---

Fechamento
Compromisso: clareza, simplicidade e velocidade. Vamos gerar resultado visível na primeira semana e usar isso como ponte natural para a oferta principal. Se estiver de acordo, eu começo hoje.

— Lucas Carlos
Estrategista — Funil Interativo & Magnético`;
}