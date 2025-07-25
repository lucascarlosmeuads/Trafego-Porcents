import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, FileText, Brain, Zap, ImageIcon, Settings, Mic, CheckCircle, XCircle, Bot } from "lucide-react";
import { toast } from "sonner";
import { type BusinessAnalysis, type MultipleAdOptions } from "@/services/openai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageProviderFactory, type UnifiedImageParams } from "@/services/imageProviderFactory";
import { TextProviderFactory } from "@/services/textProviderFactory";
import { ApiConfigManager } from "@/services/apiConfig";
import MultiProviderConfigPanel from "./MultiProviderConfigPanel";
import AudioRecorderPanel from "./AudioRecorderPanel";

interface GeneratedImageData {
  id: string;
  url: string;
  topPhrase: string;
  bottomCTA: string;
  imageDescription: string;
  timestamp: Date;
}

interface ImageGalleryProps {
  images: GeneratedImageData[];
  activeImageId: string | null;
  onImageSelect: (imageId: string) => void;
  onDownload: (imageUrl: string, index: number) => void;
}

const ImageGallery = ({ images, activeImageId, onImageSelect, onDownload }: ImageGalleryProps) => {
  if (images.length === 0) return null;

  const activeImage = images.find(img => img.id === activeImageId) || images[images.length - 1];

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-primary" />
          Galeria de Criativos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeImage && (
          <div className="relative group">
            <img
              src={activeImage.url}
              alt="Criativo gerado"
              className="w-full rounded-lg shadow-lg border border-border"
              style={{ aspectRatio: '1/1' }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                onClick={() => onDownload(activeImage.url, images.indexOf(activeImage))}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        )}

        {activeImage && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <div>
              <Label className="text-sm font-medium text-foreground">Frase de Topo:</Label>
              <p className="text-sm text-muted-foreground mt-1">{activeImage.topPhrase}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Call-to-Action:</Label>
              <p className="text-sm text-muted-foreground mt-1">{activeImage.bottomCTA}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Conceito Visual:</Label>
              <p className="text-sm text-muted-foreground mt-1">{activeImage.imageDescription}</p>
            </div>
          </div>
        )}

        {images.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageId === image.id ? 'border-primary' : 'border-transparent hover:border-primary/50'
                }`}
                onClick={() => onImageSelect(image.id)}
              >
                <img
                  src={image.url}
                  alt="Miniatura"
                  className="w-full aspect-square object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProviderStatus = () => {
  const [apiConfig] = useState(() => ApiConfigManager.getInstance());
  const textProvider = apiConfig.getActiveTextProvider();
  const imageProvider = apiConfig.getActiveImageProvider();
  const hasTextProvider = apiConfig.hasAnyTextProviderConfigured();
  const hasImageProvider = apiConfig.hasAnyImageProviderConfigured();

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {hasTextProvider ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-muted-foreground">Texto:</span>
          <span className="font-medium">{textProvider || 'Não configurado'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {hasImageProvider ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-muted-foreground">Imagem:</span>
          <span className="font-medium">{imageProvider || 'Não configurado'}</span>
        </div>
      </div>
    </div>
  );
};

export default function AdCreator() {
  const [documentText, setDocumentText] = useState("");
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [multipleOptions, setMultipleOptions] = useState<MultipleAdOptions | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [selectedTopPhrase, setSelectedTopPhrase] = useState("");
  const [selectedImageDesc, setSelectedImageDesc] = useState("");
  const [selectedCTA, setSelectedCTA] = useState("");

  const [apiConfig] = useState(() => ApiConfigManager.getInstance());

  const hasTextProvider = apiConfig.hasAnyTextProviderConfigured();
  const hasImageProvider = apiConfig.hasAnyImageProviderConfigured();

  const handleAnalyzeDocument = async () => {
    if (!hasTextProvider || !documentText) {
      toast.error("Por favor, configure um provedor de texto e insira o texto do documento");
      return;
    }

    setIsAnalyzing(true);
    try {
      const textService = TextProviderFactory.getDefaultTextService(apiConfig);
      if (!textService) {
        throw new Error("Nenhum provedor de texto configurado");
      }

      const result = await textService.analyzeBusinessDocument(documentText);
      setAnalysis(result);
      toast.success("Documento analisado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao analisar documento");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateOptions = async () => {
    if (!analysis) {
      toast.error("Analise o documento primeiro");
      return;
    }

    setIsGeneratingOptions(true);
    try {
      const textService = TextProviderFactory.getDefaultTextService(apiConfig);
      if (!textService) {
        throw new Error("Nenhum provedor de texto configurado");
      }

      const options = await textService.generateMultipleAdOptions(analysis);
      setMultipleOptions(options);
      toast.success("Opções de anúncios geradas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar opções");
    } finally {
      setIsGeneratingOptions(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedTopPhrase || !selectedImageDesc || !selectedCTA) {
      toast.error("Selecione uma opção de cada categoria");
      return;
    }

    if (!hasImageProvider) {
      toast.error("Configure um provedor de imagem primeiro");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const imageService = ImageProviderFactory.getDefaultImageService(apiConfig);
      if (!imageService) {
        throw new Error("Nenhum provedor de imagem configurado");
      }
      
      const prompt = `Crie uma imagem publicitária para Instagram (1080x1080) com o conceito: ${selectedImageDesc}. 
      A imagem deve ser impactante, profissional e adequada para o texto "${selectedTopPhrase}" e call-to-action "${selectedCTA}". 
      Estilo visual moderno, cores vibrantes, alta qualidade.`;

      const imageParams: UnifiedImageParams = {
        prompt,
        width: 1024,
        height: 1024,
        quality: 'high',
        style: 'vivid'
      };

      const image = await imageService.generateImage(imageParams);

      const newImage: GeneratedImageData = {
        id: Date.now().toString(),
        url: image.url,
        topPhrase: selectedTopPhrase,
        bottomCTA: selectedCTA,
        imageDescription: selectedImageDesc,
        timestamp: new Date()
      };

      setGeneratedImages(prev => [...prev, newImage]);
      setActiveImageId(newImage.id);
      toast.success("Imagem gerada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar imagem");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `criativo-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Imagem baixada!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
    }
  };

  const handleTranscriptionComplete = (transcription: string) => {
    setDocumentText(transcription);
    toast.success("Áudio transcrito com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 py-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            Gerador de Criativos Inteligente
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforme documentos de negócio em anúncios persuasivos com IA
          </p>
        </div>

        <Tabs defaultValue="analise" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="analise" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Análise
            </TabsTrigger>
            <TabsTrigger value="apis" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              APIs
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Áudio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analise" className="space-y-6">
            {/* Status dos Provedores */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <ProviderStatus />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna Esquerda: Análise */}
              <div className="space-y-6">
                {/* Análise Inteligente de Documento */}
                <Card className="bg-card border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Brain className="h-6 w-6 text-primary" />
                      Análise Inteligente de Documento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="document" className="text-sm font-medium text-foreground">
                        Cole o texto do seu documento ou transcrição de áudio
                      </Label>
                      <Textarea
                        id="document"
                        placeholder="Cole aqui informações sobre seu negócio, produto, serviço ou qualquer material que você queira transformar em um anúncio impactante..."
                        value={documentText}
                        onChange={(e) => setDocumentText(e.target.value)}
                        rows={8}
                        className="mt-2 bg-background border-border text-foreground resize-none"
                      />
                    </div>
                    <Button 
                      onClick={handleAnalyzeDocument}
                      disabled={isAnalyzing || !documentText || !hasTextProvider}
                      size="lg"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 mr-2" />
                          Analisar Documento
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Resultado da Análise */}
                {analysis && (
                  <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Análise do Negócio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <Label className="text-sm font-medium text-foreground">Tipo de Negócio:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{analysis.businessType}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <Label className="text-sm font-medium text-foreground">Público-Alvo:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{analysis.targetAudience}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <Label className="text-sm font-medium text-foreground">Proposta de Valor:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{analysis.uniqueValue}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <Label className="text-sm font-medium text-foreground">Principais Dores:</Label>
                          <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside space-y-1">
                            {analysis.painPoints.map((pain, index) => (
                              <li key={index}>{pain}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleGenerateOptions}
                        disabled={isGeneratingOptions || !hasTextProvider}
                        size="lg"
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium"
                      >
                        {isGeneratingOptions ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Gerando Opções...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-2" />
                            Gerar Múltiplas Opções
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Seleção de Opções */}
                {multipleOptions && (
                  <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Opções de Anúncio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Frase de Topo</Label>
                        <Select value={selectedTopPhrase} onValueChange={setSelectedTopPhrase}>
                          <SelectTrigger className="mt-1 bg-background border-border">
                            <SelectValue placeholder="Selecione uma frase de topo" />
                          </SelectTrigger>
                          <SelectContent>
                            {multipleOptions.topPhrases.map((phrase, index) => (
                              <SelectItem key={index} value={phrase}>
                                {phrase}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground">Conceito Visual</Label>
                        <Select value={selectedImageDesc} onValueChange={setSelectedImageDesc}>
                          <SelectTrigger className="mt-1 bg-background border-border">
                            <SelectValue placeholder="Selecione um conceito visual" />
                          </SelectTrigger>
                          <SelectContent>
                            {multipleOptions.imageDescriptions.map((desc, index) => (
                              <SelectItem key={index} value={desc}>
                                {desc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground">Call-to-Action</Label>
                        <Select value={selectedCTA} onValueChange={setSelectedCTA}>
                          <SelectTrigger className="mt-1 bg-background border-border">
                            <SelectValue placeholder="Selecione um CTA" />
                          </SelectTrigger>
                          <SelectContent>
                            {multipleOptions.bottomCTAs.map((cta, index) => (
                              <SelectItem key={index} value={cta}>
                                {cta}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !selectedTopPhrase || !selectedImageDesc || !selectedCTA || !hasImageProvider}
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-medium shadow-lg"
                      >
                        {isGeneratingImage ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Gerando Criativo...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-5 w-5 mr-2" />
                            ✨ Gerar Criativo
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Coluna Direita: Galeria */}
              <div>
                {generatedImages.length > 0 ? (
                  <ImageGallery
                    images={generatedImages}
                    activeImageId={activeImageId}
                    onImageSelect={setActiveImageId}
                    onDownload={handleDownloadImage}
                  />
                ) : (
                  <Card className="bg-card border-border shadow-lg">
                    <CardContent className="text-center py-16">
                      <ImageIcon className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhum criativo gerado ainda</h3>
                      <p className="text-muted-foreground">
                        Siga os passos ao lado para gerar seus primeiros criativos inteligentes!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apis">
            <MultiProviderConfigPanel />
          </TabsContent>

          <TabsContent value="audio">
            <AudioRecorderPanel onTranscriptionComplete={handleTranscriptionComplete} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}