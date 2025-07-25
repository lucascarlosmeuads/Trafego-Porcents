import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Download, Eye, Mic, FileText, Brain, Sparkles, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PDFUploadArea } from './PDFUploadArea';
import { DataPreviewCards } from './DataPreviewCards';
import { CopyGenerationArea } from './CopyGenerationArea';
import { ImageGenerationArea } from './ImageGenerationArea';
import { CreativeGallery } from './CreativeGallery';
import AudioRecorderPanel from '@/components/AudioRecorderPanel';
import { ApiConfigModal } from './ApiConfigModal';
import { ApiConfigManager } from '@/services/apiConfig';

export default function GeradorCriativosDashboard() {
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'copy' | 'image' | 'gallery'>('input');
  const [pdfAnalysisId, setPdfAnalysisId] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedCopy, setSelectedCopy] = useState<any>(null);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [documentText, setDocumentText] = useState<string>('');
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleAnalyzeDocument = async () => {
    if (!documentText.trim()) {
      toast.error('Por favor, insira ou grave um documento primeiro');
      return;
    }

    const config = ApiConfigManager.getInstance();
    if (!config.getOpenAIKey()) {
      toast.error('Configure a API do GPT primeiro');
      setIsApiConfigOpen(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate document analysis - replace with actual API call
      const mockAnalysis = {
        publico_alvo: 'Empreendedores digitais',
        promessa: 'Aumente suas vendas em 300%',
        estrutura: 'Problema → Solução → Prova → CTA',
        abordagens: ['Urgência', 'Autoridade', 'Prova social']
      };
      
      setAnalysisData(mockAnalysis);
      setCurrentStep('analysis');
      toast.success('Documento analisado com sucesso!');
    } catch (error) {
      toast.error('Erro ao analisar documento');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCopy = async () => {
    if (!analysisData) {
      toast.error('Analise o documento primeiro');
      return;
    }

    setIsGeneratingCopy(true);
    try {
      // Simulate copy generation - replace with actual API call
      setCurrentStep('copy');
      toast.success('Variações de copy geradas!');
    } catch (error) {
      toast.error('Erro ao gerar variações de copy');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleCopySelected = (copy: any) => {
    setSelectedCopy(copy);
    setCurrentStep('image');
  };

  const handleGenerateImage = async () => {
    const config = ApiConfigManager.getInstance();
    const provider = config.getImageProvider();
    
    if ((provider === 'openai' && !config.getOpenAIKey()) || 
        (provider === 'runway' && !config.getRunwayKey())) {
      toast.error('Configure a API primeiro');
      setIsApiConfigOpen(true);
      return;
    }

    setIsGeneratingImage(true);
    try {
      // Simulate image generation - replace with actual API call
      const mockImages = [{ imageURL: '/placeholder.svg', prompt: 'Test prompt' }];
      setGeneratedImages(mockImages);
      setCurrentStep('gallery');
      toast.success('Imagem gerada com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar imagem');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAudioTranscription = (text: string) => {
    setDocumentText(text);
    toast.success('Áudio transcrito com sucesso!');
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header with Settings */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerador de Criativos</h1>
          <p className="text-muted-foreground">
            Analise documentos e gere criativos personalizados usando IA
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsApiConfigOpen(true)}
          className="shrink-0"
          title="Configurar API de geração"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Document Input Section */}
        {currentStep === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Entrada do Documento
              </CardTitle>
              <CardDescription>
                Escolha como inserir seu documento para análise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Recording */}
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Gravar Áudio</h3>
                <p className="text-muted-foreground mb-4">
                  Grave seu áudio e transforme em documento automaticamente
                </p>
                <AudioRecorderPanel onTranscriptionComplete={handleAudioTranscription} />
              </div>

              {/* Text Input */}
              <div className="border-2 border-dashed border-muted rounded-lg p-6">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Colar Documento</h3>
                <p className="text-muted-foreground mb-4">
                  Cole ou digite seu texto diretamente
                </p>
                <Textarea
                  placeholder="Cole seu documento aqui..."
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  className="min-h-32"
                />
              </div>

              {/* Analyze Button */}
              {documentText.trim() && (
                <div className="text-center">
                  <Button 
                    onClick={handleAnalyzeDocument}
                    disabled={isAnalyzing}
                    size="lg"
                    className="min-w-48"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isAnalyzing ? 'Analisando...' : 'Analisar Documento'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {currentStep === 'analysis' && analysisData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise do Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataPreviewCards data={analysisData} />
              <div className="text-center">
                <Button 
                  onClick={handleGenerateCopy}
                  disabled={isGeneratingCopy}
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGeneratingCopy ? 'Gerando...' : 'Gerar Variações de Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Copy Generation */}
        {currentStep === 'copy' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Variações de Copy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CopyGenerationArea 
                pdfData={analysisData}
                onCopySelected={handleCopySelected}
              />
            </CardContent>
          </Card>
        )}

        {/* Image Generation */}
        {currentStep === 'image' && selectedCopy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Gerar Imagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Copy Selecionada:</h4>
                <p className="text-sm">{selectedCopy.headline}</p>
              </div>
              <div className="text-center">
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  size="lg"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {isGeneratingImage ? 'Gerando Imagem...' : 'Gerar Imagem'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {currentStep === 'gallery' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Galeria de Criativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreativeGallery creatives={generatedImages} />
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        {currentStep !== 'input' && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentStep === 'analysis') setCurrentStep('input');
                else if (currentStep === 'copy') setCurrentStep('analysis');
                else if (currentStep === 'image') setCurrentStep('copy');
                else if (currentStep === 'gallery') setCurrentStep('image');
              }}
            >
              Voltar
            </Button>
          </div>
        )}
      </div>

      {/* API Config Modal */}
      <ApiConfigModal 
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
      />
    </div>
  );
}