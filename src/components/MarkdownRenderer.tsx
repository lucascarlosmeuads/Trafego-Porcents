import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

// Preprocessa o markdown para:
// - Remover títulos (H1/H2) duplicados no topo
// - Normalizar listas: converte linhas começando com ". " em "- " e garante espaço após número (ex: "1. texto")
export function preprocessMarkdown(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');

  // Pular linhas em branco iniciais
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;

  // Remover H1/H2 iniciais (duas primeiras se existirem)
  let removed = 0;
  while (i < lines.length && removed < 2) {
    const t = lines[i].trim();
    if (t.startsWith('# ') || t.startsWith('## ')) {
      i++;
      // pular linhas em branco após o título
      while (i < lines.length && lines[i].trim() === '') i++;
      removed++;
    } else {
      break;
    }
  }

  const rest = lines.slice(i).map((line) => {
    let l = line;
    // Converter ". " em bullet real
    if (/^\s*\.\s+/.test(l)) {
      l = l.replace(/^\s*\.\s+/, '- ');
    }
    // Garantir espaço após número do item: 1.Texto -> 1. Texto
    l = l.replace(/^(\s*)(\d+)\.(\S)/, '$1$2. $3');
    return l;
  });

  // Inserir linha em branco antes de listas se necessário para melhor renderização Markdown
  const normalized: string[] = [];
  for (let j = 0; j < rest.length; j++) {
    const curr = rest[j];
    const prev = normalized[normalized.length - 1] ?? '';
    const startsList = /^(\s*)([-*+]\s|\d+\.\s)/.test(curr.trim());
    if (startsList && prev.trim() !== '' && !/^(\s*)([-*+]\s|\d+\.\s)/.test(prev.trim())) {
      normalized.push('');
    }
    normalized.push(curr);
  }

  return normalized.join('\n');
}

export const MarkdownRenderer: React.FC<{ content: string }>= ({ content }) => {
  const processed = preprocessMarkdown(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="font-bold text-2xl mt-0 mb-2 leading-tight" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="font-semibold text-lg mt-3 mb-1 leading-snug" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="font-medium text-base mt-2 mb-1 leading-snug" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="my-1 leading-relaxed" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="my-2 list-disc list-outside pl-5" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="my-2 list-decimal list-outside pl-5" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="my-0.5 leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
      }}
    >
      {processed}
    </ReactMarkdown>
  );
};
