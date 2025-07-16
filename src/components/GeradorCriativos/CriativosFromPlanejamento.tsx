import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Loader2, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface GeneratedCopy {
  id: string;
  headline: string;
  visualConcept: string;
  description: string;
  cta: string;
  copyType: string;
  createdAt: Date;
}

interface CriativosFromPlanejamentoProps {
  planejamento: string;
  emailGestor: string;
}

export const CriativosFromPlanejamento = ({ planejamento, emailGestor }: CriativosFromPlanejamentoProps) => {
  const [copies, setCopies] = useState<GeneratedCopy[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const extrairCopies = () => {
      const copiesExtraidas: GeneratedCopy[] = [];
      
      try {
        console.log('🔍 Iniciando extração de copies do planejamento...');
        
        // Procurar por padrões das novas copies estruturadas (COPY 1, COPY 2, COPY 3)
        const copyRegex = /## [🚀🎯💡] COPY (\d+) - (.+?)\n\n\*\*HEADLINE:\*\* (.+?)\n\n\*\*CONCEITO VISUAL CONTRAINTUITIVO:\*\*\n(.+?)\n\n\*\*DESCRIÇÃO PERSUASIVA:\*\*\n(.+?)\n\n\*\*CTA:\*\* (.+?)\n/gs;
        
        const matches = [...planejamento.matchAll(copyRegex)];
        
        if (matches.length > 0) {
          console.log(`📋 Encontrados ${matches.length} copies estruturadas`);
          
          matches.forEach((match, index) => {
            const copyNumber = match[1];
            const copyType = match[2].trim();
            const headline = match[3].trim().replace(/\[|\]/g, '');
            const visualConcept = match[4].trim().replace(/\[|\]/g, '');
            const description = match[5].trim().replace(/\[|\]/g, '');
            const cta = match[6].trim().replace(/\[|\]/g, '');

            copiesExtraidas.push({
              id: `copy-${copyNumber}`,
              headline: headline,
              visualConcept: visualConcept,
              description: description,
              cta: cta,
              copyType: copyType,
              createdAt: new Date()
            });
          });
        } else {
          // Fallback: tentar extrair do formato antigo
          console.log('⚠️ Formato novo não encontrado, tentando extração do formato antigo...');
          
          const linhaRegex = /### • Linha\s+(\d+)\s+–\s+(.+?)\n\n\*\*📢 Títulos.*?\n((?:.*\n)*?)\*\*📝 Descrições.*?\n((?:.*\n)*?)(?=###|---|$)/gs;
          const linhaMatches = [...planejamento.matchAll(linhaRegex)];
          
          linhaMatches.forEach((match) => {
            const linha = match[1];
            const tipo = match[2];
            const titulosText = match[3];
            const descricoesText = match[4];
            
            const titulos = titulosText.split('\n')
              .filter(t => t.trim() && t.match(/^\d+\./))
              .map(t => t.replace(/^\d+\.\s*/, '').trim());
            
            const descricoes = descricoesText.split('\n')
              .filter(d => d.trim() && d.match(/^\d+\./))
              .map(d => d.replace(/^\d+\.\s*/, '').trim());
            
            const maxCombinations = Math.min(titulos.length, descricoes.length);
            for (let i = 0; i < maxCombinations; i++) {
              if (titulos[i] && descricoes[i]) {
                copiesExtraidas.push({
                  id: `linha-${linha}-${i + 1}`,
                  headline: titulos[i],
                  visualConcept: `Imagem profissional relacionada a: ${tipo}`,
                  description: descricoes[i],
                  cta: 'SAIBA MAIS',
                  copyType: tipo,
                  createdAt: new Date()
                });
              }
            }
          });
          
          // Se ainda não encontrou nada, criar copy genérica
          if (copiesExtraidas.length === 0) {
            console.log('⚠️ Nenhum formato reconhecido, criando copy genérica...');
            
            copiesExtraidas.push({
              id: 'generic-copy',
              headline: 'Transforme Seu Negócio Hoje',
              visualConcept: 'Uma pessoa relaxada trabalhando em casa com resultados positivos na tela',
              description: 'Estratégia personalizada que gera resultados reais para seu negócio',
              cta: 'COMEÇAR AGORA',
              copyType: 'Genérica',
              createdAt: new Date()
            });
          }
        }

        console.log(`✅ Total de ${copiesExtraidas.length} copies extraídas`);
        setCopies(copiesExtraidas);
        
      } catch (error) {
        console.error('❌ Erro ao extrair copies:', error);
        setCopies([]);
      }
    };

    if (planejamento) {
      extrairCopies();
    }
  }, [planejamento]);

  const handleGenerateImage = async (copy: GeneratedCopy) => {
    setGenerating(copy.id);
    
    try {
      console.log('🎨 Gerando imagem para copy:', copy.headline);
      
      const response = await supabase.functions.invoke('dall-e-generator', {
        body: {
          selectedCopy: {
            headline: copy.headline,
            copy: copy.description,
            cta: copy.cta,
            style: copy.copyType,
            visualConcept: copy.visualConcept
          },
          emailGestor: emailGestor
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar imagem');
      }

      if (response.data?.success) {
        toast({
          title: "Imagem gerada com sucesso!",
          description: `Criativo baseado em: ${copy.headline}`,
        });
      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error: any) {
      console.error('Erro ao gerar imagem:', error);
      toast({
        title: "Erro ao gerar imagem",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  if (copies.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma copy encontrada no planejamento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Gerar Criativos das Copies</h3>
        <Badge variant="secondary">{copies.length} copies encontradas</Badge>
      </div>

      <div className="grid gap-4">
        {copies.map((copy) => (
          <Card key={copy.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{copy.headline}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {copy.copyType}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Conceito Visual:</p>
                  <p className="text-sm bg-secondary/20 p-2 rounded-md italic text-secondary-foreground">
                    {copy.visualConcept}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descrição:</p>
                  <p className="text-sm">{copy.description}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CTA:</p>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {copy.cta}
                  </Badge>
                </div>

                <Button
                  onClick={() => handleGenerateImage(copy)}
                  disabled={generating !== null}
                  className="w-full"
                  size="sm"
                >
                  {generating === copy.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando Imagem...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 mr-2" />
                      Gerar Imagem
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};