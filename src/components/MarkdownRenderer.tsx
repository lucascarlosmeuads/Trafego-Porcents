import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

// Preprocessa o markdown para:
// - Remover títulos (H1/H2) duplicados no topo
// - Normalizar listas e melhorar formatação
// - Remover instruções internas e diretrizes
// - Aplicar diretrizes de redação (quiz -> funil interativo)
export function preprocessMarkdown(text: string): string {
  if (!text) return '';

  let out = text;

  // 1) Normalizar bullets soltos para "- " (alinhados)
  out = out.replace(/^\s*[•◦▪·–—-]\s+/gm, '- ');

  // 2) Garantir espaço após número em listas ordenadas (1.Texto -> 1. Texto)
  out = out.replace(/^(\s*)(\d+)\.(\S)/gm, '$1$2. $3');

  // 3) Remover espaços à direita
  out = out.replace(/[ \t]+$/gm, '');

  // 4) Limitar quebras de linha consecutivas a no máximo 2
  out = out.replace(/\n{3,}/g, '\n\n');

  return out;
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const processed = preprocessMarkdown(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="font-bold text-3xl md:text-4xl leading-tight mt-0 mb-2 text-foreground" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="font-semibold text-2xl md:text-3xl mt-6 mb-2 text-foreground" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="font-semibold text-xl md:text-2xl mt-4 mb-2 text-foreground" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-3 leading-relaxed text-muted-foreground" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="mb-3 list-disc list-outside pl-6 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="mb-3 list-decimal list-outside pl-6 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-6 border-border" {...props} />,
      }}
    >
      {processed}
    </ReactMarkdown>
  );
};
