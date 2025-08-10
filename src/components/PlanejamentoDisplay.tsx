import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, RefreshCw, Loader2, Wand2 } from "lucide-react";
import { downloadPlanPdf } from "@/utils/planDownload";
import { toast } from "sonner";
import { CriativosFromPlanejamento } from "@/components/GeradorCriativos/CriativosFromPlanejamento";

interface PlanejamentoDisplayProps {
  planejamento: string;
  onRegenerate?: () => void;
  showActions?: boolean;
  isRegenerating?: boolean;
  showCriativosGenerator?: boolean;
  emailGestor?: string;
  emailCliente?: string;
  nomeCliente?: string;
  requireFormattingBeforeDownload?: boolean;
  onFormatted?: (novo: string) => void;
}


export const PlanejamentoDisplay = ({ 
  planejamento, 
  onRegenerate, 
  showActions = true,
  isRegenerating = false,
  showCriativosGenerator = false,
  emailGestor = "",
  emailCliente = "",
  nomeCliente = "",
  requireFormattingBeforeDownload = false,
  onFormatted,
}: PlanejamentoDisplayProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [hasFormatted, setHasFormatted] = useState(false);
  const [displayedContent, setDisplayedContent] = useState<string>(planejamento);
  const contentRef = useRef<HTMLDivElement>(null);


  const handleDownload = async () => {
    if (isDownloading) return;
    if (requireFormattingBeforeDownload && !hasFormatted) {
      toast.warning("Formate o planejamento antes de baixar");
      return;
    }
    setIsDownloading(true);
    try {
      const clienteName = nomeCliente ? nomeCliente.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') : 'cliente';
      const fileName = `planejamento-estrategico-${clienteName}-${new Date().toISOString().split('T')[0]}.pdf`;
      await downloadPlanPdf({
        content: displayedContent,
        title: 'Planejamento Estratégico',
        filename: fileName,
      });
      toast.success("PDF baixado com sucesso!", { description: `Arquivo ${fileName} foi baixado` });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF", { description: "Tente novamente ou contate o suporte" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFormat = async () => {
    if (!emailCliente) {
      toast.error("Email do cliente ausente", { description: "Não foi possível formatar sem email." });
      return;
    }
    setIsFormatting(true);
    try {
      const { reformatSinglePlan } = await import("@/utils/reformatSinglePlan");
      const novo = await reformatSinglePlan(emailCliente);
      setDisplayedContent(novo);
      setHasFormatted(true);
      onFormatted?.(novo);
      toast.success("Planejamento formatado com sucesso!");
    } catch (e: any) {
      console.error('Erro ao formatar planejamento:', e);
      toast.error("Erro ao formatar", { description: e?.message || "Tente novamente" });
    } finally {
      setIsFormatting(false);
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
            {displayedContent}
          </ReactMarkdown>
        </div>

        {/* Gerador de Criativos */}
        {showCriativosGenerator && emailGestor && (
          <div className="pt-6 border-t">
            <CriativosFromPlanejamento 
              planejamento={planejamento}
              emailGestor={emailGestor}
              emailCliente={emailCliente}
            />
          </div>
        )}

        {/* Botões de Ação */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleFormat}
              variant="outline"
              className="flex-1"
              disabled={isFormatting || isRegenerating}
            >
              {isFormatting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Formatando...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Formatar Planejamento
                </>
              )}
            </Button>

            <Button 
              onClick={handleDownload} 
              variant="outline" 
              className="flex-1"
              disabled={isRegenerating || isDownloading || (requireFormattingBeforeDownload && !hasFormatted)}
              title={requireFormattingBeforeDownload && !hasFormatted ? "Formate antes de baixar" : undefined}
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