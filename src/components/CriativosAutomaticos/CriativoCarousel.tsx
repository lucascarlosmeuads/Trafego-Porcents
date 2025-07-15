import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Download, Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CriativoCarouselProps {
  criativos: any[];
  dadosExtraidos: any;
}

export function CriativoCarousel({ criativos, dadosExtraidos }: CriativoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const nextCriativo = () => {
    setCurrentIndex((prev) => (prev + 1) % criativos.length);
  };

  const prevCriativo = () => {
    setCurrentIndex((prev) => (prev - 1 + criativos.length) % criativos.length);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copiado!`,
      description: "Texto copiado para área de transferência."
    });
  };

  const downloadCriativo = (criativo: any) => {
    const data = {
      ...criativo,
      dadosBase: dadosExtraidos
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `criativo-${criativo.id}-${criativo.nome.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: `Criativo "${criativo.nome}" baixado com sucesso!`
    });
  };

  if (!criativos || criativos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Nenhum criativo disponível</p>
        </CardContent>
      </Card>
    );
  }

  const currentCriativo = criativos[currentIndex];

  return (
    <div className="space-y-4">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Criativos Gerados</h3>
          <Badge variant="secondary">
            {currentIndex + 1} de {criativos.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevCriativo}
            disabled={criativos.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextCriativo}
            disabled={criativos.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Criativo Atual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentCriativo.nome}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCriativo(currentCriativo)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Imagem */}
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              {currentCriativo.imagemUrl ? (
                <img
                  src={currentCriativo.imagemUrl}
                  alt={`Criativo ${currentCriativo.nome}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center space-y-2">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div className="text-sm text-muted-foreground">
                    Preview da Imagem
                  </div>
                  <div className="text-xs text-muted-foreground max-w-xs">
                    {currentCriativo.erro || 'Imagem será gerada pelo designer'}
                  </div>
                </div>
              )}
            </div>

            {/* Especificações Visuais */}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Layout:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {currentCriativo.layout}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Estilo:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {currentCriativo.estilo}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Cores:</span>
                <div className="flex gap-2 mt-1">
                  {currentCriativo.elementos?.cores?.map((cor: string, index: number) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: cor }}
                      title={cor}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Textual */}
        <Card>
          <CardHeader>
            <CardTitle>Textos e Copy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Headline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Headline Principal:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(currentCriativo.headline, 'Headline')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-3 bg-muted rounded text-sm font-medium">
                {currentCriativo.headline}
              </div>
            </div>

            {/* Subheadline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Subheadline:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(currentCriativo.subheadline, 'Subheadline')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-3 bg-muted rounded text-sm">
                {currentCriativo.subheadline}
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Call to Action:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(currentCriativo.cta, 'CTA')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-3 bg-primary/10 rounded text-sm font-medium text-center border border-primary/20">
                {currentCriativo.cta}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Observações Estratégicas:</span>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                {currentCriativo.observacoes}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://canva.com', '_blank')}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar no Canva
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCriativo(currentCriativo)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Miniatures */}
      {criativos.length > 1 && (
        <div className="flex gap-2 justify-center pt-4">
          {criativos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}