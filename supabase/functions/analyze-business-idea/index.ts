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

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { briefing_id } = await req.json();

    if (!briefing_id) {
      throw new Error('briefing_id é obrigatório');
    }

    console.log('Analisando briefing:', briefing_id);

    // Buscar dados do briefing
    const { data: briefing, error: briefingError } = await supabase
      .from('briefings_cliente')
      .select('*')
      .eq('id', briefing_id)
      .single();

    if (briefingError || !briefing) {
      throw new Error(`Briefing não encontrado: ${briefingError?.message}`);
    }

    console.log('Briefing encontrado:', briefing.nome_produto);

    // Verificar se já existe análise
    const { data: existingIdeia } = await supabase
      .from('ideias_negocio')
      .select('id')
      .eq('briefing_id', briefing_id)
      .maybeSingle();

    if (existingIdeia) {
      console.log('Análise já existe para este briefing');
      return new Response(
        JSON.stringify({ success: true, message: 'Análise já existe', id: existingIdeia.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Montar prompt para análise da IA
    const prompt = `
Analise este briefing de negócio e extraia informações estruturadas:

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
Analise este negócio e retorne um JSON estruturado com:

1. **titulo_ideia**: Um título atrativo e claro para esta ideia de negócio (máximo 80 caracteres)
2. **descricao_projeto**: Descrição clara e completa do projeto em 2-3 parágrafos
3. **dores_identificadas**: Array com 3-5 principais dores que este negócio resolve
4. **categoria_negocio**: Uma categoria clara (ex: "E-commerce", "Serviços Digitais", "Alimentação", "Consultoria", etc.)
5. **potencial_mercado**: Análise do potencial de mercado (Alto/Médio/Baixo) com justificativa
6. **insights_ia**: Objeto com:
   - resumo_executivo: Resumo executivo do negócio
   - pontos_fortes: Array com 3-5 pontos fortes identificados
   - desafios_potenciais: Array com 3-5 desafios que podem enfrentar
   - sugestoes_melhorias: Array com 3-5 sugestões para melhorar a proposta
   - score_viabilidade: Nota de 1-10 para viabilidade do negócio

**IMPORTANTE:**
- Seja específico e prático nas análises
- Considere o mercado brasileiro
- Retorne APENAS o JSON, sem texto adicional
- Use linguagem profissional mas acessível
`;

    console.log('Enviando prompt para OpenAI...');

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
            content: 'Você é um especialista em análise de negócios e empreendedorismo. Analise briefings e extraia insights valiosos para ajudar empreendedores.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const analiseText = aiResponse.choices[0].message.content;

    console.log('Resposta da IA recebida');

    let analise: IdeiaAnalise;
    try {
      analise = JSON.parse(analiseText);
    } catch (parseError) {
      console.error('Erro ao parsear JSON da IA:', parseError);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    // Salvar análise no banco
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
      console.error('Erro ao salvar ideia:', insertError);
      throw new Error(`Erro ao salvar análise: ${insertError.message}`);
    }

    console.log('Análise salva com sucesso:', novaIdeia.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Análise concluída com sucesso',
        ideia: novaIdeia 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na análise:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});