import { toast } from "sonner";

export interface GenerateImageParams {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  textPosition?: "center" | "top" | "bottom" | "left" | "right";
  mainText?: string;
  subText?: string;
}

export interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}

export interface BusinessAnalysis {
  businessType: string;
  targetAudience: string;
  painPoints: string[];
  uniqueValue: string;
  persuasionOpportunities: string[];
}

export interface AdPromptElements {
  topPhrase: string;
  imageDescription: string;
  bottomCTA: string;
  completePrompt: string;
}

export interface MultipleAdOptions {
  topPhrases: string[];
  imageDescriptions: string[];
  bottomCTAs: string[];
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private cleanMarkdownJson(text: string): string {
    // Remove markdown code blocks if present
    return text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/gi, '')
      .trim();
  }

  async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    const prompt = `
Analise o seguinte documento de negócio e extraia informações estratégicas para criação de anúncios persuasivos:

DOCUMENTO:
${documentText}

Forneça a análise em formato JSON com os seguintes campos:
{
  "businessType": "Tipo específico do negócio",
  "targetAudience": "Perfil detalhado do público-alvo",
  "painPoints": ["Dor principal 1", "Dor principal 2", "Dor principal 3"],
  "uniqueValue": "Principal diferencial/proposta de valor",
  "persuasionOpportunities": ["Oportunidade 1", "Oportunidade 2", "Oportunidade 3"]
}

Responda APENAS com o JSON válido, sem texto adicional.`;

    try {
      console.log("🔄 Iniciando análise do documento...");
      console.log("📝 Tamanho do documento:", documentText.length, "caracteres");
      console.log("🔑 Chave API presente:", this.apiKey ? "Sim" : "Não");
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      console.log("📡 Resposta da API:", response.status, response.statusText);

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Erro da API OpenAI:", error);
        throw new Error(error.error?.message || "Erro ao analisar documento");
      }

      const data = await response.json();
      console.log("✅ Dados recebidos da API:", data);
      
      const analysisText = data.choices[0].message.content;
      console.log("📊 Texto da análise (bruto):", analysisText);
      
      const cleanedText = this.cleanMarkdownJson(analysisText);
      console.log("🧹 Texto limpo:", cleanedText);
      
      const parsedAnalysis = JSON.parse(cleanedText);
      console.log("🎯 Análise parseada:", parsedAnalysis);
      
      return parsedAnalysis;
    } catch (error) {
      console.error("💥 Erro completo:", error);
      if (error instanceof Error) {
        console.error("📋 Mensagem do erro:", error.message);
        console.error("🔍 Stack trace:", error.stack);
      }
      throw new Error("Falha na análise do documento. Verifique sua chave API e tente novamente.");
    }
  }

  async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    const prompt = `
Com base na análise do negócio, crie MÚLTIPLAS OPÇÕES para um anúncio Meta Ads formato Instagram:

ANÁLISE DO NEGÓCIO:
- Tipo: ${analysis.businessType}
- Público: ${analysis.targetAudience}
- Dores: ${analysis.painPoints.join(', ')}
- Valor Único: ${analysis.uniqueValue}
- Oportunidades: ${analysis.persuasionOpportunities.join(', ')}

Gere 7 OPÇÕES de cada elemento:

1. FRASES DE TOPO: Extremamente agressivas, sensacionalistas, geradoras de cliques (máximo 8 palavras cada)
2. CONCEITOS VISUAIS: Imagens contraintuitivas e impactantes que chamam atenção no feed do Instagram
3. CALLS-TO-ACTION: Frases curtas e intrigantes (máximo 6 palavras cada)

FORMATO OBRIGATÓRIO - responda APENAS o JSON:
{
  "topPhrases": [
    "Frase sensacionalista 1",
    "Frase sensacionalista 2",
    "Frase sensacionalista 3",
    "Frase sensacionalista 4",
    "Frase sensacionalista 5",
    "Frase sensacionalista 6",
    "Frase sensacionalista 7"
  ],
  "imageDescriptions": [
    "Conceito visual contraintuitivo 1 para Instagram",
    "Conceito visual contraintuitivo 2 para Instagram",
    "Conceito visual contraintuitivo 3 para Instagram",
    "Conceito visual contraintuitivo 4 para Instagram",
    "Conceito visual contraintuitivo 5 para Instagram",
    "Conceito visual contraintuitivo 6 para Instagram",
    "Conceito visual contraintuitivo 7 para Instagram"
  ],
  "bottomCTAs": [
    "CTA intrigante 1",
    "CTA intrigante 2",
    "CTA intrigante 3",
    "CTA intrigante 4",
    "CTA intrigante 5",
    "CTA intrigante 6",
    "CTA intrigante 7"
  ]
}

REGRAS:
- Português brasileiro perfeito
- Sensacionalismo sem ofensividade
- Incongruência visual para parar o scroll
- Foco total em curiosidade extrema
- Formato Instagram 1080x1080`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao gerar opções múltiplas");
      }

      const data = await response.json();
      const optionsText = data.choices[0].message.content;
      const cleanedOptionsText = this.cleanMarkdownJson(optionsText);
      return JSON.parse(cleanedOptionsText);
    } catch (error) {
      console.error("Erro ao gerar opções múltiplas:", error);
      throw new Error("Falha ao gerar opções. Verifique sua chave API e tente novamente.");
    }
  }

  async generateAdPrompt(analysis: BusinessAnalysis): Promise<AdPromptElements> {
    const prompt = `
Com base na análise do negócio, crie elementos para um anúncio altamente persuasivo e sensacionalista:

ANÁLISE DO NEGÓCIO:
- Tipo: ${analysis.businessType}
- Público: ${analysis.targetAudience}
- Dores: ${analysis.painPoints.join(', ')}
- Valor Único: ${analysis.uniqueValue}
- Oportunidades: ${analysis.persuasionOpportunities.join(', ')}

Crie um anúncio com:

1. FRASE DE TOPO: Uma frase extremamente agressiva, sensacionalista e geradora de cliques (máximo 8 palavras)
2. DESCRIÇÃO DA IMAGEM: Conceito visual com incongruência criativa e impactante
3. CALL-TO-ACTION: Frase curta e intrigante na parte inferior (máximo 6 palavras)

Formate a resposta em JSON:
{
  "topPhrase": "Frase de topo sensacionalista",
  "imageDescription": "Descrição detalhada da imagem com incongruência criativa",
  "bottomCTA": "Call-to-action intrigante",
  "completePrompt": "Prompt completo unificado para geração da imagem incluindo a frase de topo '...' no centro da imagem e o CTA '...' na parte inferior, com a descrição visual criativa"
}

IMPORTANTE:
- Use português brasileiro perfeito
- Seja sensacionalista mas não ofensivo
- Crie incongruência visual interessante
- Foque em gerar curiosidade extrema
- No completePrompt, integre TUDO em um prompt único para DALL-E
- Responda APENAS com JSON válido`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao gerar prompt do anúncio");
      }

      const data = await response.json();
      const promptText = data.choices[0].message.content;
      const cleanedPromptText = this.cleanMarkdownJson(promptText);
      return JSON.parse(cleanedPromptText);
    } catch (error) {
      console.error("Erro ao gerar prompt do anúncio:", error);
      throw new Error("Falha na geração do prompt. Tente novamente.");
    }
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    const enhancedPrompt = this.buildPromptWithText(params);

    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          size: params.size || "1024x1024",
          quality: params.quality || "hd",
          style: params.style || "vivid",
          n: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao gerar imagem");
      }

      const data = await response.json();
      return {
        url: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt || params.prompt,
      };
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      throw new Error("Falha ao gerar imagem. Verifique sua chave API e tente novamente.");
    }
  }

  private buildPromptWithText(params: GenerateImageParams): string {
    let prompt = params.prompt;

    if (params.mainText || params.subText) {
      const textInstruction = this.getTextPositionInstruction(params.textPosition || "center");

      if (params.mainText && params.subText) {
        prompt += `. Include text elements: "${params.mainText}" as the main heading in large, bold letters ${textInstruction}, and "${params.subText}" as smaller descriptive text below it. Make sure the text is clearly readable and professionally styled.`;
      } else if (params.mainText) {
        prompt += `. Include the text "${params.mainText}" prominently displayed ${textInstruction} in large, bold, readable letters that complement the overall design.`;
      } else if (params.subText) {
        prompt += `. Include the text "${params.subText}" ${textInstruction} in clear, readable letters.`;
      }

      prompt += ` The text should be perfectly integrated into the design, not overlaid. Use professional typography that matches the overall aesthetic. Text must be in Portuguese and clearly legible.`;
    }

    return prompt;
  }

  private getTextPositionInstruction(position: string): string {
    switch (position) {
      case "top":
        return "at the top of the image";
      case "bottom":
        return "at the bottom of the image";
      case "left":
        return "on the left side of the image";
      case "right":
        return "on the right side of the image";
      case "center":
      default:
        return "in the center of the image";
    }
  }
}