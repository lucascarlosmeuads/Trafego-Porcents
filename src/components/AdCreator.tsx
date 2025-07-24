import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Wand2, FileText, Brain, Zap, ImageIcon, Settings, Mic } from "lucide-react";
import { toast } from "sonner";
import { OpenAIService, type BusinessAnalysis, type AdPromptElements, type MultipleAdOptions } from "@/services/openai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageProviderFactory, type UnifiedImageParams } from "@/services/imageProviderFactory";
import { ApiConfigManager } from "@/services/apiConfig";
import ApiConfigPanel from "./ApiConfigPanel";
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
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          🖼️ Galeria de Anúncios Gerados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Imagem principal */}
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
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Informações do criativo ativo */}
        {activeImage && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Frase de Topo:</Label>
              <p className="text-sm text-muted-foreground">{activeImage.topPhrase}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Call-to-Action:</Label>
              <p className="text-sm text-muted-foreground">{activeImage.bottomCTA}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Conceito Visual:</Label>
              <p className="text-sm text-muted-foreground">{activeImage.imageDescription}</p>
            </div>
          </div>
        )}

        {/* Miniaturas */}
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

  const handleAnalyzeDocument = async () => {
    const openaiKey = apiConfig.getOpenAIKey();
    
    if (!openaiKey || !documentText) {
      toast.error("Por favor, configure a chave OpenAI e insira o texto do documento");
      return;
    }

    setIsAnalyzing(true);
    try {
      const openaiService = new OpenAIService(openaiKey);
      const result = await openaiService.analyzeBusinessDocument(documentText);
      setAnalysis(result);
      toast.success("📊 Documento analisado com sucesso!");
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
      const openaiKey = apiConfig.getOpenAIKey();
      const openaiService = new OpenAIService(openaiKey);
      const options = await openaiService.generateMultipleAdOptions(analysis);
      setMultipleOptions(options);
      toast.success("🎯 Opções de anúncios geradas com sucesso!");
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

    setIsGeneratingImage(true);
    try {
      const provider = apiConfig.getImageProvider();
      const imageService = ImageProviderFactory.createService(provider, apiConfig);
      
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
      toast.success("🖼️ Imagem gerada com sucesso!");
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
      toast.success("📁 Imagem baixada!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
    }
  };

  const handleTranscriptionComplete = (transcription: string) => {
    setDocumentText(transcription);
    toast.success("🎤 Áudio transcrito com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="space-y-4 text-white">
            <h1 className="text-4xl font-bold">
              🚀 Gerador de Criativos Inteligente
            </h1>
            <p className="text-xl max-w-2xl">
              Transforme documentos de negócio em anúncios persuasivos com IA
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6 -mt-8 relative z-20">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Criar Anúncios</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="audio">Gravação de Áudio</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna Esquerda: Configuração e Controles */}
              <div className="space-y-6">
                {/* Análise de Documento */}
                <Card className="bg-gradient-card border-border shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      📄 Documento de Negócio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="document">Cole o texto do seu documento ou transcrição de áudio</Label>
                      <Textarea
                        id="document"
                        placeholder="Cole aqui informações sobre seu negócio, produto ou serviço..."
                        value={documentText}
                        onChange={(e) => setDocumentText(e.target.value)}
                        rows={6}
                        className="bg-background border-border"
                      />
                    </div>
                    <Button 
                      onClick={handleAnalyzeDocument}
                      disabled={isAnalyzing || !documentText}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
                      ) : (
                        <><Brain className="h-4 w-4 mr-2" /> Analisar Documento</>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Análise Resultado */}
                {analysis && (
                  <Card className="bg-gradient-card border-border shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        🧠 Análise do Negócio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="font-medium">Tipo de Negócio:</Label>
                        <p className="text-sm text-muted-foreground">{analysis.businessType}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Público-Alvo:</Label>
                        <p className="text-sm text-muted-foreground">{analysis.targetAudience}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Principais Dores:</Label>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {analysis.painPoints.map((pain, index) => (
                            <li key={index}>{pain}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Label className="font-medium">Proposta de Valor:</Label>
                        <p className="text-sm text-muted-foreground">{analysis.uniqueValue}</p>
                      </div>
                      
                      <Separator />
                      
                      <Button 
                        onClick={handleGenerateOptions}
                        disabled={isGeneratingOptions}
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        {isGeneratingOptions ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando Opções...</>
                        ) : (
                          <><Zap className="h-4 w-4 mr-2" /> Gerar Opções de Anúncios</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Seleção de Opções */}
                {multipleOptions && (
                  <Card className="bg-gradient-card border-border shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5" />
                        🎯 Opções de Anúncio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Frase de Topo</Label>
                        <Select value={selectedTopPhrase} onValueChange={setSelectedTopPhrase}>
                          <SelectTrigger className="bg-background border-border">
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
                        <Label>Conceito Visual</Label>
                        <Select value={selectedImageDesc} onValueChange={setSelectedImageDesc}>
                          <SelectTrigger className="bg-background border-border">
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
                        <Label>Call-to-Action</Label>
                        <Select value={selectedCTA} onValueChange={setSelectedCTA}>
                          <SelectTrigger className="bg-background border-border">
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
                        disabled={isGeneratingImage || !selectedTopPhrase || !selectedImageDesc || !selectedCTA}
                        className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                      >
                        {isGeneratingImage ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando Imagem...</>
                        ) : (
                          <><ImageIcon className="h-4 w-4 mr-2" /> ✨ Gerar Criativo</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Coluna Direita: Galeria de Imagens */}
              <div>
                <ImageGallery
                  images={generatedImages}
                  activeImageId={activeImageId}
                  onImageSelect={setActiveImageId}
                  onDownload={handleDownloadImage}
                />
                
                {generatedImages.length === 0 && (
                  <Card className="bg-gradient-card border-border shadow-card">
                    <CardContent className="text-center py-12">
                      <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Nenhum criativo gerado ainda</h3>
                      <p className="text-muted-foreground">
                        Siga os passos ao lado para gerar seus primeiros criativos inteligentes!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <ApiConfigPanel />
          </TabsContent>

          <TabsContent value="audio">
            <AudioRecorderPanel onTranscriptionComplete={handleTranscriptionComplete} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}