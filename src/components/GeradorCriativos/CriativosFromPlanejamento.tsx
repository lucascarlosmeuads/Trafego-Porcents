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
  subheadline: string;
  copy: string;
  cta: string;
  style: string;
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
        // Procurar por "Linha 1" e "Linha 2" do planejamento
        const linhaRegex = /Linha\s+(\d+)\s+.*?\n([\s\S]*?)(?=Linha\s+\d+|---|$)/gi;
        const matches = [...planejamento.matchAll(linhaRegex)];
        
        matches.forEach((match, index) => {
          const linha = match[1];
          const conteudo = match[2];
          
          // Extrair títulos (até 40 caracteres)
          const tituloRegex = /Títulos.*?\n((?:.*\n)*?)(?=Descri[çc][õo]|$)/gi;
          const tituloMatch = tituloRegex.exec(conteudo);
          const titulos = tituloMatch?.[1]
            ?.split('\n')
            ?.filter(t => t.trim() && !t.includes('Descrição'))
            ?.map(t => t.replace(/^[•\-\*]\s*/, '').trim()) || [];

          // Extrair descrições (até 125 caracteres)
          const descricaoRegex = /Descri[çc][õo].*?\n((?:.*\n)*?)(?=---|Linha|$)/gi;
          const descricaoMatch = descricaoRegex.exec(conteudo);
          const descricoes = descricaoMatch?.[1]
            ?.split('\n')
            ?.filter(d => d.trim())
            ?.map(d => d.replace(/^[•\-\*]\s*/, '').trim()) || [];

          // Criar copies combinando títulos e descrições
          const maxCombinations = Math.min(titulos.length, descricoes.length);
          for (let i = 0; i < maxCombinations; i++) {
            if (titulos[i] && descricoes[i]) {
              copiesExtraidas.push({
                id: `linha-${linha}-copy-${i + 1}`,
                headline: titulos[i],
                subheadline: `Linha ${linha} Criativo`,
                copy: descricoes[i],
                cta: 'SAIBA MAIS',
                style: `Linha ${linha}`,
                createdAt: new Date()
              });
            }
          }
        });

        // Se não encontrou copies específicas, tentar extração genérica
        if (copiesExtraidas.length === 0) {
          const linhas = planejamento.split('\n').filter(l => l.trim() && l.length > 10);
          if (linhas.length > 0) {
            copiesExtraidas.push({
              id: 'generic-copy',
              headline: 'Transforme Seu Negócio',
              subheadline: 'Baseado no seu planejamento estratégico',
              copy: 'Estratégia personalizada criada especialmente para o seu negócio',
              cta: 'COMEÇAR AGORA',
              style: 'Planejamento Estratégico',
              createdAt: new Date()
            });
          }
        }

        console.log(`📋 Extraídas ${copiesExtraidas.length} copies do planejamento`);
        setCopies(copiesExtraidas);
        
      } catch (error) {
        console.error('Erro ao extrair copies:', error);
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
            copy: copy.copy,
            cta: copy.cta,
            style: copy.style
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
                    {copy.style}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descrição:</p>
                  <p className="text-sm">{copy.copy}</p>
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