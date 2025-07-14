import React from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PlanejamentoDisplayProps {
  planejamento: string;
  onRegenerate?: () => void;
  showActions?: boolean;
  isRegenerating?: boolean;
}

export const PlanejamentoDisplay = ({ 
  planejamento, 
  onRegenerate, 
  showActions = true,
  isRegenerating = false
}: PlanejamentoDisplayProps) => {

  const handleDownload = async () => {
    try {
      // Encontrar o elemento com o conteúdo do planejamento
      const element = document.querySelector('.prose') as HTMLElement;
      if (!element) {
        console.error('Elemento do planejamento não encontrado');
        return;
      }

      // Criar uma cópia temporária para o PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '-9999px';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      
      // Adicionar logo e cabeçalho da Tráfego Porcents
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
          <h1 style="color: #0066cc; font-size: 24px; margin: 0;">TRÁFEGO PORCENTS</h1>
          <p style="color: #666; margin: 5px 0;">Planejamento Estratégico</p>
        </div>
        <div style="color: black;">
          ${element.innerHTML.replace(/color:\s*hsl\([^)]*\)/g, 'color: black').replace(/color:\s*white/g, 'color: black').replace(/text-white/g, 'text-black')}
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 12px;">
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          <p>Tráfego Porcents - Estratégias de Performance</p>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Converter para canvas e depois para PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Remover elemento temporário
      document.body.removeChild(tempDiv);

      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Adicionar primeira página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas extras se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download do PDF
      pdf.save('planejamento-estrategico-trafego-porcents.pdf');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback para download em markdown
      const element = document.createElement("a");
      const file = new Blob([planejamento], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = "planejamento-estrategico.md";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/20 p-3 rounded-full">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Planejamento Estratégico
        </CardTitle>
        <p className="text-muted-foreground">
          Estratégia personalizada gerada pela nossa IA
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Conteúdo do Planejamento */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-muted-foreground">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              hr: () => (
                <hr className="my-6 border-border" />
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                  {children}
                </blockquote>
              )
            }}
          >
            {planejamento}
          </ReactMarkdown>
        </div>

        {/* Botões de Ação */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={handleDownload} 
              variant="outline" 
              className="flex-1"
              disabled={isRegenerating}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Planejamento
            </Button>
            {onRegenerate && (
              <Button 
                onClick={onRegenerate} 
                variant="outline" 
                className="flex-1"
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};