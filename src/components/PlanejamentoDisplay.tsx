import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
}: PlanejamentoDisplayProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);


  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      
      // Função para limpar e normalizar texto convertendo emoticons para texto
      const cleanText = (text: string): string => {
        // Mapeamento de emoticons para texto equivalente
        const emojiMap: { [key: string]: string } = {
          '🎯': '(alvo)',
          '📈': '(crescimento)',
          '💡': '(ideia)',
          '🚀': '(foguete)',
          '📊': '(gráfico)',
          '💰': '(dinheiro)',
          '⭐': '(estrela)',
          '🔥': '(fogo)',
          '📱': '(celular)',
          '💻': '(computador)',
          '🌟': '(estrela)',
          '🎉': '(festa)',
          '🏆': '(troféu)',
          '📝': '(nota)',
          '✅': '(check)',
          '❌': '(x)',
          '⚡': '(raio)',
          '🔍': '(lupa)',
          '📢': '(alto-falante)',
          '🎪': '(circo)',
          '🎨': '(arte)',
          '🌐': '(global)',
          '📲': '(notificação)',
          '💎': '(diamante)',
          '🎭': '(teatro)',
          '🔧': '(ferramenta)',
          '⚙️': '(engrenagem)',
          '📅': '(calendário)',
          '⏰': '(relógio)',
          '📍': '(localização)',
          '🏃': '(corrida)',
          '🏋️': '(exercício)',
          '💪': '(força)',
          '🧠': '(cérebro)',
          '👥': '(grupo)',
          '👤': '(pessoa)',
          '🤝': '(aperto de mão)',
          '💼': '(maleta)',
          '🏢': '(prédio)',
          '🏠': '(casa)',
          '🛒': '(carrinho)',
          '🛍️': '(compras)',
          '📦': '(pacote)',
          '🚚': '(entrega)',
          '✨': '(brilho)',
          '🌈': '(arco-íris)',
          '☀️': '(sol)',
          '🌙': '(lua)',
          '🔔': '(sino)',
          '📣': '(megafone)',
          '🎵': '(música)',
          '🎶': '(notas musicais)',
          '🎤': '(microfone)',
          '📷': '(câmera)',
          '🎬': '(filme)',
          '📺': '(tv)',
          '📻': '(rádio)',
          '🎮': '(game)',
          '🕹️': '(controle)',
          '🎲': '(dado)',
          '🃏': '(carta)',
          '🏅': '(medalha)',
          '🥇': '(primeiro lugar)',
          '🥈': '(segundo lugar)',
          '🥉': '(terceiro lugar)',
          '👍': '(like)',
          '👎': '(dislike)',
          '👌': '(ok)',
          '✌️': '(vitória)',
          '🤞': '(dedos cruzados)',
          '🙏': '(obrigado)',
          '❤️': '(coração)',
          '💖': '(coração brilhante)',
          '💙': '(coração azul)',
          '💚': '(coração verde)',
          '💛': '(coração amarelo)',
          '🧡': '(coração laranja)',
          '💜': '(coração roxo)',
          '🖤': '(coração preto)',
          '🤍': '(coração branco)',
          '💔': '(coração partido)',
          '💕': '(dois corações)',
          '💞': '(corações girando)',
          '💓': '(coração batendo)',
          '💗': '(coração crescendo)',
          '💘': '(coração com flecha)',
          '💝': '(coração presente)'
        };

        let result = text;
        
        // Primeiro: substituir emojis específicos do mapeamento
        Object.keys(emojiMap).forEach(emoji => {
          const regex = new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          result = result.replace(regex, emojiMap[emoji]);
        });
        
        // Segundo: remover TODOS os emojis restantes com regex mais robusta
        result = result.replace(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu, '');
        
        return result
          // Normalizar quebras de linha
          .replace(/\r\n/g, '\n')
          // Remover múltiplos espaços
          .replace(/\s+/g, ' ')
          // Preservar formatação negrito mas remover markdown
          .replace(/\*\*(.*?)\*\*/g, '$1') // negrito
          .replace(/\*(.*?)\*/g, '$1') // itálico
          .replace(/__(.*?)__/g, '$1') // sublinhado
          .replace(/~~(.*?)~~/g, '$1') // riscado
          // Remover links markdown
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          // Limpar blockquotes
          .replace(/^>\s*/gm, '')
          .trim();
      };

      // Processar markdown para texto limpo e bem formatado
      const processMarkdown = (text: string): Array<{type: string, content: string, level?: number}> => {
        const lines = text.split('\n');
        const processed: Array<{type: string, content: string, level?: number}> = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          // Títulos
          if (trimmed.startsWith('#')) {
            const level = trimmed.match(/^#+/)?.[0].length || 1;
            const content = cleanText(trimmed.replace(/^#+\s*/, ''));
            if (content) {
              processed.push({ type: 'heading', content, level });
            }
          }
          // Listas numeradas
          else if (trimmed.match(/^\d+\.\s/)) {
            const content = cleanText(trimmed.replace(/^\d+\.\s*/, ''));
            if (content) {
              processed.push({ type: 'numbered-list', content });
            }
          }
          // Listas com bullets
          else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = cleanText(trimmed.replace(/^[-*]\s*/, ''));
            if (content) {
              processed.push({ type: 'list', content });
            }
          }
          // Blockquotes
          else if (trimmed.startsWith('>')) {
            const content = cleanText(trimmed.replace(/^>\s*/, ''));
            if (content) {
              processed.push({ type: 'quote', content });
            }
          }
          // Parágrafos
          else {
            const content = cleanText(trimmed);
            if (content && content.length > 2) {
              processed.push({ type: 'paragraph', content });
            }
          }
        }
        
        return processed;
      };
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Configurações de layout
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let currentY = margin;
      
      // Cabeçalho
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Planejamento Estratégico", pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Tráfego Porcents - ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;
      
      // Processar conteúdo
      const elements = processMarkdown(planejamento);
      
      for (const element of elements) {
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
        }
        
        switch (element.type) {
          case 'heading':
            const fontSize = element.level === 1 ? 16 : element.level === 2 ? 14 : 12;
            pdf.setFontSize(fontSize);
            pdf.setFont("helvetica", "bold");
            const headingLines = pdf.splitTextToSize(element.content, maxWidth);
            pdf.text(headingLines, margin, currentY);
            currentY += (fontSize * 0.35) * headingLines.length + 8;
            break;
            
          case 'paragraph':
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            const paragraphLines = pdf.splitTextToSize(element.content, maxWidth);
            pdf.text(paragraphLines, margin, currentY);
            currentY += (11 * 0.35) * paragraphLines.length + 6;
            break;
            
          case 'list':
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            const listLines = pdf.splitTextToSize(`• ${element.content}`, maxWidth - 5);
            pdf.text(listLines, margin + 5, currentY);
            currentY += (11 * 0.35) * listLines.length + 4;
            break;
            
          case 'numbered-list':
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            const numberedLines = pdf.splitTextToSize(`${element.content}`, maxWidth - 10);
            pdf.text(numberedLines, margin + 10, currentY);
            currentY += (11 * 0.35) * numberedLines.length + 4;
            break;
            
          case 'quote':
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "italic");
            const quoteLines = pdf.splitTextToSize(`"${element.content}"`, maxWidth - 10);
            pdf.text(quoteLines, margin + 10, currentY);
            currentY += (10 * 0.35) * quoteLines.length + 6;
            break;
        }
      }
      
      // Rodapé na última página
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.text("Documento gerado pela equipe Tráfego Porcents", pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Download com nome personalizado
      const clienteName = nomeCliente ? nomeCliente.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') : 'cliente';
      const fileName = `planejamento-estrategico-${clienteName}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF baixado com sucesso!", { 
        description: `Arquivo ${fileName} foi baixado` 
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF", { 
        description: "Tente novamente ou contate o suporte" 
      });
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