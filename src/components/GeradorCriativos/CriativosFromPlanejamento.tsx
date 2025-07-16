import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Loader2, Image, Download, RefreshCw } from 'lucide-react';
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

interface GeneratedImage {
  id: string;
  imageUrl: string;
  copyId: string;
  geradoEm: string;
}

interface CriativosFromPlanejamentoProps {
  planejamento: string;
  emailGestor: string;
  emailCliente: string;
}

export const CriativosFromPlanejamento = ({ planejamento, emailGestor }: CriativosFromPlanejamentoProps) => {
  const [copies, setCopies] = useState<GeneratedCopy[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const extrairCopies = () => {
      const copiesExtraidas: GeneratedCopy[] = [];
      
      try {
        console.log('🔍 Iniciando extração de copies do planejamento...');
        
        // Procurar por padrões das novas copies estruturadas (COPY 1, COPY 2, COPY 3)
        const copyRegex = /## [🚀🎯💡] COPY (\d+) - (.+?)\n\n\*\*HEADLINE:\*\* (.+?)\n\n\*\*CONCEITO VISUAL CONTRAINTUITIVO:\*\*\n(.+?)\n\n\*\*DESCRIÇÃO PERSUASIVA:\*\*\n(.+?)\n\n\*\*CTA:\*\* (.+?)(?=\n\n|$)/gs;
        
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

  // Buscar imagens geradas
  useEffect(() => {
    const fetchGeneratedImages = async () => {
      if (copies.length === 0) return;
      
      setLoadingImages(true);
      try {
        const { data, error } = await supabase
          .from('criativos_gerados')
          .select('id, arquivo_url, criativos, created_at')
          .eq('email_gestor', emailGestor)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24h
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar imagens:', error);
          return;
        }

        const images: GeneratedImage[] = data?.map(item => ({
          id: item.id,
          imageUrl: item.arquivo_url || '',
          copyId: item.criativos?.headline || item.criativos?.id || 'unknown',
          geradoEm: item.created_at
        })) || [];

        console.log('🖼️ [CriativosFromPlanejamento] Imagens carregadas:', images.length, 'Total');

        setGeneratedImages(images);
      } catch (error) {
        console.error('Erro ao buscar imagens geradas:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchGeneratedImages();
  }, [copies, emailGestor]);

  const refreshImages = async () => {
    setLoadingImages(true);
    try {
      const { data, error } = await supabase
        .from('criativos_gerados')
        .select('id, arquivo_url, criativos, created_at')
        .eq('email_gestor', emailGestor)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (!error && data) {
        const images: GeneratedImage[] = data.map(item => ({
          id: item.id,
          imageUrl: item.arquivo_url || '',
          copyId: item.criativos?.headline || 'unknown',
          geradoEm: item.created_at
        }));
        setGeneratedImages(images);
      }
    } catch (error) {
      console.error('Erro ao atualizar imagens:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleGenerateImage = async (copy: GeneratedCopy) => {
    setGenerating(copy.id);
    
    try {
      console.log('🎨 Gerando imagem para copy:', copy.headline);
      
      console.log('🚀 [CriativosFromPlanejamento] Enviando dados para geração:', {
        headline: copy.headline,
        visualConcept: copy.visualConcept.substring(0, 50) + '...',
        description: copy.description.substring(0, 50) + '...',
        cta: copy.cta,
        emailGestor
      });

      const response = await supabase.functions.invoke('dall-e-generator', {
        body: {
          selectedCopy: {
            id: copy.id,
            headline: copy.headline,
            copy: copy.description,
            description: copy.description,
            cta: copy.cta,
            style: copy.copyType,
            copyType: copy.copyType,
            visualConcept: copy.visualConcept
          },
          emailGestor: emailGestor
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar imagem');
      }

      if (response.data?.success) {
        console.log('✅ [CriativosFromPlanejamento] Imagem gerada com sucesso!', response.data);
        
        toast({
          title: "Imagem gerada com sucesso!",
          description: `Criativo baseado em: ${copy.headline}`,
        });
        
        // Refresh automático das imagens após 1 segundo
        setTimeout(() => {
          console.log('🔄 [CriativosFromPlanejamento] Fazendo refresh das imagens...');
          refreshImages();
        }, 1000);
        
        // Segundo refresh após 5 segundos para garantir
        setTimeout(() => {
          console.log('🔄 [CriativosFromPlanejamento] Segundo refresh das imagens...');
          refreshImages();
        }, 5000);
      } else {
        console.error('❌ [CriativosFromPlanejamento] Resposta inválida:', response.data);
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error: any) {
      console.error('❌ [CriativosFromPlanejamento] Erro ao gerar imagem:', error);
      console.error('❌ [CriativosFromPlanejamento] Detalhes do erro:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
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

  const getImagesForCopy = (copyHeadline: string) => {
    return generatedImages.filter(img => {
      // Tentar várias estratégias de matching
      const normalizedCopyHeadline = copyHeadline.toLowerCase().trim();
      const normalizedImgId = img.copyId.toLowerCase().trim();
      
      return normalizedImgId === normalizedCopyHeadline ||
             normalizedImgId.includes(normalizedCopyHeadline.substring(0, 10)) ||
             normalizedCopyHeadline.includes(normalizedImgId.substring(0, 10)) ||
             img.geradoEm && new Date(img.geradoEm) > new Date(Date.now() - 10 * 60 * 1000); // Últimos 10 minutos
    });
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download concluído!",
        description: `Imagem ${filename} baixada com sucesso`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Gerar Criativos das Copies</h3>
          <Badge variant="secondary">{copies.length} copies encontradas</Badge>
        </div>
        
        <Button
          onClick={refreshImages}
          disabled={loadingImages}
          variant="outline"
          size="sm"
        >
          {loadingImages ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {copies.map((copy) => {
          const copyImages = getImagesForCopy(copy.headline);
          
          return (
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
                <div className="space-y-4">
                  {/* HEADLINE */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">📢 HEADLINE:</p>
                    <p className="text-base font-bold bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-900">
                      {copy.headline}
                    </p>
                  </div>

                  {/* CONCEITO VISUAL CONTRAINTUITIVO */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">🎨 CONCEITO VISUAL CONTRAINTUITIVO:</p>
                    <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md italic text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900">
                      {copy.visualConcept}
                    </p>
                  </div>
                  
                  {/* DESCRIÇÃO PERSUASIVA */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">📝 DESCRIÇÃO PERSUASIVA:</p>
                    <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded-md text-green-800 dark:text-green-200 border border-green-200 dark:border-green-900">
                      {copy.description}
                    </p>
                  </div>
                  
                  {/* CTA */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">🎯 CTA:</p>
                    <Badge variant="secondary" className="text-sm font-bold px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                      {copy.cta}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGenerateImage(copy)}
                      disabled={generating !== null}
                      className="flex-1"
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

                   {/* Seção de Imagens Geradas */}
                  {copyImages.length > 0 ? (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Image className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-green-600">
                          ✅ Imagens Geradas ({copyImages.length})
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {copyImages.map((image) => (
                          <div key={image.id} className="relative">
                            <div className="aspect-square rounded-md overflow-hidden bg-muted">
                              <img
                                src={image.imageUrl}
                                alt={copy.headline}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+';
                                }}
                              />
                            </div>
                            
                            <div className="absolute top-2 right-2">
                              <Button
                                onClick={() => downloadImage(image.imageUrl, `creative-${copy.headline.replace(/[^a-zA-Z0-9]/g, '-')}-${image.id}.png`)}
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mt-1">
                              Gerada em: {new Date(image.geradoEm).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : generating === copy.id ? (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <p className="text-sm font-medium text-blue-600">
                          🎨 Gerando imagem... Aguarde alguns segundos
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          A imagem está sendo criada com base no conceito visual contraintuitivo. 
                          Isso pode levar de 10 a 30 segundos.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};