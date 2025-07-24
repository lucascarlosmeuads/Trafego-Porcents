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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao analisar documento");
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      return JSON.parse(analysisText);
    } catch (error) {
      console.error("Erro ao analisar documento:", error);
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
      return JSON.parse(optionsText);
    } catch (error) {
      console.error("Erro ao gerar opções múltiplas:", error);
      throw new Error("Falha ao gerar opções. Verifique sua chave API e tente novamente.");
    }
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: params.prompt,
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
}