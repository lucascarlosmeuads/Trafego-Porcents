import React from 'react';
import ReactDOM from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { normalizePlanTitle } from '@/utils/templateUtils';

interface DownloadPlanParams {
  content: string;
  title: string; // mantido por compatibilidade
  filename: string;
  nomeCliente?: string;
}

export async function downloadPlanPdf({ content, title, filename, nomeCliente }: DownloadPlanParams) {
  // Cria um container temporário fora da tela
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '794px'; // Aproximadamente A4 em 96dpi
  container.style.padding = '24px';
  container.className = 'max-w-none whitespace-pre-wrap break-words leading-relaxed bg-white text-black';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  const processedContent = normalizePlanTitle(content, nomeCliente);
  root.render(
    <div>
      <style>{`
      /* PDF reset: force black text on white background */
      * { box-sizing: border-box; text-shadow: none !important; box-shadow: none !important; filter: none !important; }
      html, body, div, span, h1, h2, h3, h4, h5, h6, p, a, li, ul, ol, strong, em, blockquote, code, pre, table, th, td { color: #000 !important; -webkit-text-fill-color: #000 !important; }
      a { color: #000 !important; text-decoration: underline; }
      code, pre { background: transparent !important; }
      hr { page-break-after: avoid; margin: 12px 0; border-color: #000 !important; }
      h1,h2,h3 { page-break-inside: avoid; break-inside: avoid; page-break-after: avoid; margin-top: 0; margin-bottom: 8px; line-height: 1.25; }
      p, li { page-break-inside: avoid; break-inside: avoid; margin: 6px 0; line-height: 1.5; }
      ul, ol { page-break-inside: avoid; break-inside: avoid; margin: 8px 0 8px 20px; }
      .section { page-break-inside: avoid; break-inside: avoid; }
      `}</style>
      {/* Títulos removidos para evitar duplicidade no PDF; usar apenas o conteúdo formatado */}
      <MarkdownRenderer content={processedContent} />
    </div>
  );

  // Aguarda o render
  await new Promise((r) => setTimeout(r, 60));

  // Inserir quebras inteligentes para evitar tópicos começando no fim da página
  const pageHeightPx = Math.round(container.clientWidth * (297 / 210)); // A4 proporcional à largura usada
  const threshold = 140; // px restantes no fim da página para migrar o próximo tópico

  const addSpacerBefore = (el: HTMLElement, h: number) => {
    const spacer = document.createElement('div');
    spacer.style.height = `${h}px`;
    spacer.style.width = '100%';
    spacer.style.breakInside = 'avoid';
    spacer.style.pageBreakInside = 'avoid';
    el.parentElement?.insertBefore(spacer, el);
  };

  const processHeadings = () => {
    const headings = Array.from(container.querySelectorAll('h2, h3')) as HTMLElement[];
    headings.forEach((el) => {
      const top = el.offsetTop;
      const yInPage = ((top % pageHeightPx) + pageHeightPx) % pageHeightPx;
      if (yInPage > pageHeightPx - threshold) {
        addSpacerBefore(el, pageHeightPx - yInPage);
      }
    });
  };

  processHeadings();
  // Segunda passada para ajustar elementos que foram deslocados
  processHeadings();

  // Converte para canvas (otimizado para velocidade)
  const dpr = 1;
  const canvas = await html2canvas(container, { 
    scale: 1,
    backgroundColor: '#ffffff', 
    useCORS: true,
    logging: false,
    foreignObjectRendering: false,
    removeContainer: true,
  });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);

  root.unmount();
  container.remove();
}
