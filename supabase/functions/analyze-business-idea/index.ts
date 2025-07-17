import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BriefingData {
  id: string;
  email_cliente: string;
  nome_produto: string;
  descricao_resumida?: string;
  publico_alvo?: string;
  diferencial?: string;
  investimento_diario?: number;
  observacoes_finais?: string;
  nome_marca?: string;
  forma_pagamento?: string;
  tipo_prestacao_servico?: string;
  abrangencia_atendimento?: string;
  localizacao_divulgacao?: string;
}

interface IdeiaAnalise {
  titulo_ideia: string;
  descricao_projeto: string;
  dores_identificadas: string[];
  categoria_negocio: string;
  potencial_mercado: string;
  insights_ia: {
    resumo_executivo: string;
    pontos_fortes: string[];
    desafios_potenciais: string[];
    sugestoes_melhorias: string[];
    score_viabilidade: number;
  };
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let briefing_id = '';

  try {
    console.log('🚀 [ANALYZE-BUSINESS-IDEA] Iniciando análise...');
    
    // Verificar chave OpenAI
    if (!openAIApiKey) {
      console.error('❌ [ERROR] OPENAI_API_KEY não configurada');
      throw new Error('OPENAI_API_KEY não está configurada');
    }
    
    console.log('✅ [CONFIG] OpenAI API Key encontrada');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const requestBody = await req.json();
    briefing_id = requestBody.briefing_id;

    if (!briefing_id) {
      console.error('❌ [ERROR] briefing_id não fornecido');
      throw new Error('briefing_id é obrigatório');
    }

    console.log(`🔍 [BRIEFING] Analisando briefing: ${briefing_id}`);

    // Buscar dados do briefing
    const { data: briefing, error: briefingError } = await supabase
      .from('briefings_cliente')
      .select('*')
      .eq('id', briefing_id)
      .single();

    if (briefingError) {
      console.error('❌ [ERROR] Erro ao buscar briefing:', briefingError);
      throw new Error(`Briefing não encontrado: ${briefingError.message}`);
    }

    if (!briefing) {
      console.error('❌ [ERROR] Briefing não existe');
      throw new Error('Briefing não encontrado');
    }

    console.log(`📋 [BRIEFING] Encontrado: "${briefing.nome_produto}" - Cliente: ${briefing.email_cliente}`);

    // Verificar se já existe análise
    const { data: existingIdeia } = await supabase
      .from('ideias_negocio')
      .select('id')
      .eq('briefing_id', briefing_id)
      .maybeSingle();

    if (existingIdeia) {
      console.log('⚠️ [SKIP] Análise já existe para este briefing');
      return new Response(
        JSON.stringify({ success: true, message: 'Análise já existe', id: existingIdeia.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Montar prompt detalhado para análise da IA
    const prompt = `
Analise este briefing de negócio brasileiro e extraia informações estruturadas:

**DADOS DO BRIEFING:**
- Produto/Serviço: ${briefing.nome_produto || 'Não informado'}
- Marca: ${briefing.nome_marca || 'Não informado'}
- Descrição: ${briefing.descricao_resumida || 'Não informado'}
- Público-alvo: ${briefing.publico_alvo || 'Não informado'}
- Diferencial: ${briefing.diferencial || 'Não informado'}
- Investimento diário: R$ ${briefing.investimento_diario || 0}
- Tipo de serviço: ${briefing.tipo_prestacao_servico || 'Não informado'}
- Abrangência: ${briefing.abrangencia_atendimento || 'Não informado'}
- Localização: ${briefing.localizacao_divulgacao || 'Não informado'}
- Observações: ${briefing.observacoes_finais || 'Não informado'}

**TAREFA:**
Analise este negócio brasileiro e retorne APENAS um JSON estruturado com:

{
  "titulo_ideia": "Título atrativo (máximo 80 caracteres)",
  "descricao_projeto": "Descrição clara em 2-3 parágrafos do projeto",
  "dores_identificadas": ["dor1", "dor2", "dor3", "dor4", "dor5"],
  "categoria_negocio": "Categoria clara (ex: E-commerce, Serviços Digitais, Alimentação, Consultoria, Saúde, Educação, etc.)",
  "potencial_mercado": "Alto/Médio/Baixo com justificativa",
  "insights_ia": {
    "resumo_executivo": "Resumo executivo do negócio",
    "pontos_fortes": ["ponto1", "ponto2", "ponto3", "ponto4", "ponto5"],
    "desafios_potenciais": ["desafio1", "desafio2", "desafio3", "desafio4"],
    "sugestoes_melhorias": ["sugestao1", "sugestao2", "sugestao3", "sugestao4"],
    "score_viabilidade": 8
  }
}

**IMPORTANTE:**
- Considere o mercado brasileiro
- Seja específico e prático
- Retorne APENAS o JSON válido
- Score de 1-10 baseado em viabilidade real
`;

    console.log('🤖 [OPENAI] Enviando prompt para OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de negócios e empreendedorismo brasileiro. Analise briefings e extraia insights valiosos. Retorne APENAS JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [OPENAI] Erro na API:', response.status, errorText);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const analiseText = aiResponse.choices[0].message.content;

    console.log('✅ [OPENAI] Resposta recebida, parseando JSON...');
    console.log('📄 [OPENAI] Resposta completa:', analiseText);

    let analise: IdeiaAnalise;
    try {
      // Tentar extrair JSON da resposta (caso venha com texto extra)
      const jsonMatch = analiseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analiseText;
      analise = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ [JSON] Erro ao parsear JSON da IA:', parseError);
      console.error('📄 [JSON] Resposta original:', analiseText);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    console.log('✅ [JSON] JSON parseado com sucesso');
    console.log(`📊 [ANALYSIS] Título: "${analise.titulo_ideia}"`);
    console.log(`📊 [ANALYSIS] Categoria: "${analise.categoria_negocio}"`);
    console.log(`📊 [ANALYSIS] Potencial: "${analise.potencial_mercado}"`);
    console.log(`📊 [ANALYSIS] Score: ${analise.insights_ia?.score_viabilidade || 'N/A'}`);

    // Salvar análise no banco
    console.log('💾 [DATABASE] Salvando análise no banco...');
    
    const { data: novaIdeia, error: insertError } = await supabase
      .from('ideias_negocio')
      .insert({
        email_cliente: briefing.email_cliente,
        briefing_id: briefing.id,
        titulo_ideia: analise.titulo_ideia,
        descricao_projeto: analise.descricao_projeto,
        produto_servico: briefing.nome_produto,
        publico_alvo: briefing.publico_alvo,
        dores_identificadas: analise.dores_identificadas,
        diferenciais: briefing.diferencial,
        categoria_negocio: analise.categoria_negocio,
        potencial_mercado: analise.potencial_mercado,
        investimento_sugerido: briefing.investimento_diario,
        status_analise: 'analisado',
        insights_ia: analise.insights_ia,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ [DATABASE] Erro ao salvar ideia:', insertError);
      throw new Error(`Erro ao salvar análise: ${insertError.message}`);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ [SUCCESS] Análise salva com sucesso! ID: ${novaIdeia.id}`);
    console.log(`⏱️ [TIMING] Processamento levou ${duration}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Análise concluída com sucesso',
        ideia: novaIdeia,
        duration_ms: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ [FATAL] Erro na análise do briefing ${briefing_id}:`, error);
    console.error(`⏱️ [TIMING] Falha após ${duration}ms`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        briefing_id,
        duration_ms: duration
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});