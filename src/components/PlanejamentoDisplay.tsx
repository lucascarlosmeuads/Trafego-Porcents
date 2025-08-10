import React, { useState, useRef } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, RefreshCw, Loader2, Wand2 } from "lucide-react";
import { downloadPlanPdf } from "@/utils/planDownload";
import { toast } from "sonner";
import { CriativosFromPlanejamento } from "@/components/GeradorCriativos/CriativosFromPlanejamento";
import { normalizePlanTitle } from "@/utils/templateUtils";

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
      const clienteName = (nomeCliente && nomeCliente.trim().length > 0) ? nomeCliente.trim() : 'Cliente';
      const fileName = `Planejamento Estratégico – ${clienteName} (Funil Interativo & Magnético).pdf`;
      await downloadPlanPdf({
        content: displayedContent,
        title: 'Planejamento Estratégico — Funil Interativo & Magnético',
        filename: fileName,
        nomeCliente,
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
        <div ref={contentRef} className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:marker:text-muted-foreground prose-hr:border-border">
          <MarkdownRenderer content={normalizePlanTitle(displayedContent, nomeCliente)} />
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