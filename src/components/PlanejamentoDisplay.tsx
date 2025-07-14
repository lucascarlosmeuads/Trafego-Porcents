import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const cleanHtmlForPdf = (html: string): string => {
    return html
      // Remover todas as classes Tailwind CSS problemáticas
      .replace(/class="[^"]*"/g, '')
      // Forçar cor preta para todos os elementos de texto
      .replace(/<h[1-6]([^>]*)>/g, '<h$1 style="color: #000000 !important; font-weight: bold; margin: 10px 0;">$1>')
      .replace(/<p([^>]*)>/g, '<p$1 style="color: #000000 !important; margin: 8px 0; line-height: 1.5;">$1>')
      .replace(/<li([^>]*)>/g, '<li$1 style="color: #000000 !important; margin: 4px 0;">$1>')
      .replace(/<strong([^>]*)>/g, '<strong$1 style="color: #000000 !important; font-weight: bold;">$1>')
      .replace(/<span([^>]*)>/g, '<span$1 style="color: #000000 !important;">$1>')
      .replace(/<div([^>]*)>/g, '<div$1 style="color: #000000 !important;">$1>')
      // Remover estilos inline problemáticos
      .replace(/color:\s*hsl\([^)]*\)/g, 'color: #000000')
      .replace(/color:\s*white/g, 'color: #000000')
      .replace(/color:\s*var\([^)]*\)/g, 'color: #000000')
      // Garantir que backgrounds sejam brancos
      .replace(/background-color:\s*[^;]+;?/g, 'background-color: #ffffff;');
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    toast("Iniciando geração do PDF...", { 
      description: "Preparando documento para download" 
    });

    try {
      console.log('Iniciando geração do PDF...');
      
      // Usar ref se disponível, senão fallback para query selector
      const element = contentRef.current || document.querySelector('.prose') as HTMLElement;
      if (!element) {
        console.error('Elemento do planejamento não encontrado');
        toast.error("Erro ao localizar conteúdo", { 
          description: "Elemento do planejamento não encontrado" 
        });
        return;
      }

      console.log('Elemento encontrado, preparando HTML para PDF...');

      // Criar uma cópia temporária otimizada para o PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 40px;
        background-color: #ffffff !important;
        color: #000000 !important;
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        overflow: visible;
      `;
      
      // Limpar e preparar o HTML
      const cleanedHtml = cleanHtmlForPdf(element.innerHTML);
      
      // Estrutura completa do PDF com estilos inline forçados
      tempDiv.innerHTML = `
        <div style="background-color: #ffffff; color: #000000; padding: 20px;">
          <!-- Cabeçalho -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
            <h1 style="color: #0066cc !important; font-size: 28px; margin: 0; font-weight: bold;">TRÁFEGO PORCENTS</h1>
            <p style="color: #333333 !important; margin: 8px 0; font-size: 16px;">Planejamento Estratégico</p>
          </div>
          
          <!-- Conteúdo Principal -->
          <div style="color: #000000 !important; background-color: #ffffff;">
            ${cleanedHtml}
          </div>
          
          <!-- Rodapé -->
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #cccccc;">
            <p style="color: #666666 !important; font-size: 12px; margin: 5px 0;">
              Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
            <p style="color: #666666 !important; font-size: 12px; margin: 5px 0;">
              Tráfego Porcents - Estratégias de Performance Digital
            </p>
          </div>
        </div>
      `;

      console.log('HTML preparado:', tempDiv.innerHTML.substring(0, 500) + '...');
      document.body.appendChild(tempDiv);

      // Aguardar um pouco para garantir que o DOM seja renderizado
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Convertendo para canvas...');
      
      // Configurações otimizadas para o html2canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        onclone: (clonedDoc) => {
          // Aplicar estilos adicionais no documento clonado
          const clonedElement = clonedDoc.querySelector('div') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.color = '#000000';
            clonedElement.style.backgroundColor = '#ffffff';
            
            // Forçar cor preta em todos os elementos de texto
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              if (el.tagName && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'SPAN', 'STRONG', 'DIV'].includes(el.tagName)) {
                el.style.color = '#000000';
                el.style.backgroundColor = 'transparent';
              }
            });
          }
        }
      });

      // Remover elemento temporário
      document.body.removeChild(tempDiv);
      console.log('Canvas criado com sucesso');

      // Configurar e criar o PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margin;

      console.log('Gerando PDF...');

      // Adicionar primeira página
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0), 
        'PNG', 
        margin, 
        position, 
        imgWidth, 
        Math.min(imgHeight, pageHeight - margin)
      );
      
      heightLeft -= (pageHeight - margin);

      // Adicionar páginas extras se necessário
      while (heightLeft > 0) {
        pdf.addPage();
        position = -(imgHeight - heightLeft) + margin;
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0), 
          'PNG', 
          margin, 
          position, 
          imgWidth, 
          Math.min(heightLeft + margin, pageHeight - margin)
        );
        heightLeft -= (pageHeight - margin);
      }

      // Download do PDF
      const fileName = `planejamento-estrategico-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF gerado com sucesso!", { 
        description: `Arquivo ${fileName} foi baixado` 
      });
      console.log('PDF gerado e baixado com sucesso!');
      
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      
      toast.error("Erro ao gerar PDF", { 
        description: "Tentando download alternativo em Markdown..." 
      });
      
      // Fallback melhorado para download em markdown
      try {
        const element = document.createElement("a");
        const timestamp = new Date().toISOString().split('T')[0];
        const content = `# TRÁFEGO PORCENTS - Planejamento Estratégico\n\nGerado em: ${new Date().toLocaleDateString('pt-BR')}\n\n---\n\n${planejamento}`;
        const file = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `planejamento-estrategico-${timestamp}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        toast.success("Arquivo Markdown baixado", { 
          description: "PDF não pôde ser gerado, mas o conteúdo foi salvo em formato Markdown" 
        });
        console.log('Fallback: arquivo baixado como Markdown');
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        toast.error("Erro crítico", { 
          description: "Não foi possível gerar nenhum formato de arquivo. Tente novamente." 
        });
      }
    } finally {
      setIsDownloading(false);
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
        <div ref={contentRef} className="prose prose-lg max-w-none dark:prose-invert">
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
              disabled={isRegenerating || isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Planejamento
                </>
              )}
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