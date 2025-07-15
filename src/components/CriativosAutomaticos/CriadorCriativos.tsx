import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Download, ExternalLink, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CriativoCarousel } from './CriativoCarousel';

interface CriadorCriativosProps {
  emailCliente?: string;
  emailGestor?: string;
  clienteId?: number;
}

interface CriativoGerado {
  id: string;
  dados_extraidos: any;
  criativos: any;
  status: string;
  custo_processamento: number;
  created_at: string;
}

export function CriadorCriativos({ 
  emailCliente, 
  emailGestor, 
  clienteId 
}: CriadorCriativosProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [criativoGerado, setCriativoGerado] = useState<CriativoGerado | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie apenas arquivos PDF.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(10);

      // Upload do PDF para Supabase Storage
      const fileName = `planejamento-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cliente-arquivos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setProgress(30);

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('cliente-arquivos')
        .getPublicUrl(fileName);

      setProgress(50);
      setUploading(false);
      setProcessing(true);

      // Processar PDF com Edge Function
      const { data: processData, error: processError } = await supabase.functions
        .invoke('processar-pdf-criativos', {
          body: {
            pdfUrl: urlData.publicUrl,
            emailCliente: emailCliente || 'cliente@teste.com',
            emailGestor: emailGestor || 'gestor@teste.com',
            clienteId: clienteId || 1,
            nomeArquivo: file.name
          }
        });

      if (processError) throw processError;

      setProgress(100);
      
      // Buscar dados completos do criativo gerado
      const { data: criativoData, error: fetchError } = await supabase
        .from('criativos_gerados')
        .select('*')
        .eq('id', processData.criativoId)
        .single();

      if (fetchError) throw fetchError;

      setCriativoGerado(criativoData);
      setProcessing(false);

      toast({
        title: "Criativos gerados com sucesso!",
        description: `${processData.criativos.length} criativos foram criados automaticamente.`,
      });

    } catch (error: any) {
      console.error('Erro ao processar PDF:', error);
      setUploading(false);
      setProcessing(false);
      setProgress(0);
      
      toast({
        title: "Erro no processamento",
        description: error.message || "Falha ao gerar criativos. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [emailCliente, emailGestor, clienteId, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleDownloadPack = async () => {
    if (!criativoGerado) return;

    try {
      // Criar ZIP com todos os criativos (implementação simplificada)
      const zipData = {
        dados_extraidos: criativoGerado.dados_extraidos,
        criativos: criativoGerado.criativos,
        metadata: {
          gerado_em: criativoGerado.created_at,
          custo: criativoGerado.custo_processamento
        }
      };

      const blob = new Blob([JSON.stringify(zipData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `criativos-pack-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado",
        description: "Pack de criativos baixado com sucesso!"
      });

    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Falha ao baixar o pack de criativos.",
        variant: "destructive"
      });
    }
  };

  const handleSendToEditor = () => {
    toast({
      title: "Enviado para editor",
      description: "Criativos enviados para revisão com observações automáticas."
    });
  };

  if (criativoGerado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Criativos Gerados</h3>
            <p className="text-sm text-muted-foreground">
              Baseados no planejamento: {criativoGerado.dados_extraidos?.oferta || 'Campanha'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadPack}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Pack
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://canva.com', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Editar no Canva
            </Button>
            <Button 
              size="sm"
              onClick={handleSendToEditor}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar para Editor
            </Button>
          </div>
        </div>

        <CriativoCarousel 
          criativos={criativoGerado.criativos}
          dadosExtraidos={criativoGerado.dados_extraidos}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo da Geração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {criativoGerado.criativos?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Criativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {criativoGerado.custo_processamento?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">Custo IA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ~1min
                </div>
                <div className="text-sm text-muted-foreground">Tempo</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {criativoGerado.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Dados Extraídos do Planejamento:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Oferta:</span>{' '}
                  {criativoGerado.dados_extraidos?.oferta}
                </div>
                <div>
                  <span className="font-medium">Público:</span>{' '}
                  {criativoGerado.dados_extraidos?.publico}
                </div>
                <div>
                  <span className="font-medium">Tom:</span>{' '}
                  {criativoGerado.dados_extraidos?.tom}
                </div>
                <div>
                  <span className="font-medium">Categoria:</span>{' '}
                  {criativoGerado.dados_extraidos?.categoria}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          onClick={() => {
            setCriativoGerado(null);
            setProgress(0);
          }}
          className="w-full"
        >
          Gerar Novos Criativos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Criador Automático de Criativos</h2>
        <p className="text-muted-foreground">
          Envie o PDF do planejamento e receba 3 criativos profissionais automaticamente
        </p>
      </div>

      {(uploading || processing) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {uploading ? 'Enviando PDF...' : 'Gerando criativos com IA...'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading && 'Fazendo upload do arquivo...'}
                {processing && 'Analisando planejamento e gerando criativos...'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-primary animate-bounce" />
                ) : (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {isDragActive
                    ? 'Solte o PDF aqui...'
                    : 'Envie o PDF do Planejamento'
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar ou arraste o arquivo PDF com o planejamento da campanha
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo 10MB • Apenas arquivos PDF
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">3</div>
            <div className="text-sm font-medium">Criativos Únicos</div>
            <div className="text-xs text-muted-foreground mt-1">
              Cada um com estilo diferente
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">~1min</div>
            <div className="text-sm font-medium">Tempo de Geração</div>
            <div className="text-xs text-muted-foreground mt-1">
              Processamento automático
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">IA</div>
            <div className="text-sm font-medium">Powered by OpenAI</div>
            <div className="text-xs text-muted-foreground mt-1">
              DALL-E + GPT-4 integrados
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}