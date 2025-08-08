import React from 'react';
import ReactDOM from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface DownloadPlanParams {
  content: string;
  title: string; // mantido por compatibilidade
  filename: string;
}

export async function downloadPlanPdf({ content, title, filename }: DownloadPlanParams) {
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
  root.render(
    <div>
      <h1 className="font-bold text-2xl mb-2 leading-tight">
        planejamento estratégico feito por Lucas Carlos - Funil Magnético e Interativo
      </h1>
      <h2 className="font-semibold text-lg mb-2 leading-snug">
        tráfego pago em troca de % sobre as vendas
      </h2>
      <MarkdownRenderer content={content} />
    </div>
  );

  // Aguarda o render
  await new Promise((r) => setTimeout(r, 100));

  // Converte para canvas
  const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
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
