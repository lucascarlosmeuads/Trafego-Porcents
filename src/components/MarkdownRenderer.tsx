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

  // Aplicar diretrizes de redação
  let processedText = text
    .replace(/\bquiz\b/gi, 'funil interativo')
    .replace(/\bQuiz\b/g, 'Funil interativo')
    .replace(/\bQUIZ\b/g, 'FUNIL INTERATIVO');

  // Remover possíveis instruções internas marcadas no conteúdo
  const stripInternalNotes = (input: string) => {
    const lines = input.split('\n');
    const out: string[] = [];
    let skipUntilFence = false;
    let skipUntilCommentEnd = false;
    let skipDirectrizes = false;
    let skipInstrucaoFinal = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detectar início de diretrizes de redação (mais robusto)
      if (/^(DIRETRIZES\s+DE\s+REDA[ÇC][ÃA]O|diretrizes\s+de\s+reda[çc][ãa]o)/i.test(line.trim())) {
        skipDirectrizes = true;
        continue;
      }

      // Detectar início de instrução final
      if (/^(INSTRU[ÇC][ÃA]O\s+FINAL|instru[çc][ãa]o\s+final)/i.test(line.trim())) {
        skipInstrucaoFinal = true;
        continue;
      }

      // Pular todo o bloco de diretrizes até encontrar linha que não seja diretriz
      if (skipDirectrizes) {
        // Continuar pulando se a linha contém palavras típicas de diretrizes
        const isDiretrizLine = /^(NUNCA|nunca|Não|não|Use|use|Considere|considere|Linguagem|linguagem|Evite|evite)/i.test(line.trim()) ||
                              line.trim() === '' ||
                              /^\s*[-*•]\s/.test(line);
        
        if (!isDiretrizLine && /^(##?\s|###\s|\*\*|[A-Z][a-z]+.*[^:]$)/i.test(line.trim())) {
          skipDirectrizes = false;
        } else {
          continue;
        }
      }

      // Pular todo o bloco de instrução final
      if (skipInstrucaoFinal) {
        // Continuar pulando se a linha parece fazer parte da instrução final
        const isInstrucaoLine = line.trim() === '' ||
                               /^".*"$/.test(line.trim()) ||
                               /mensalidade|vendas|trabalhamos/i.test(line);
        
        if (!isInstrucaoLine && /^(##?\s|###\s|\*\*|[A-Z][a-z]+.*[^:]$)/i.test(line.trim())) {
          skipInstrucaoFinal = false;
        } else {
          continue;
        }
      }

      // Blocos de comentário HTML marcados como internos
      if (/<!--\s*internal:(start|begin)\s*-->/i.test(line)) {
        skipUntilCommentEnd = true;
        continue;
      }
      if (skipUntilCommentEnd) {
        if (/<!--\s*internal:(end|stop)\s*-->/i.test(line)) {
          skipUntilCommentEnd = false;
        }
        continue;
      }

      // Blocos cercados por crases com marcador de interno
      if (/^```.*(internal|instru)/i.test(line)) {
        skipUntilFence = true;
        continue;
      }
      if (skipUntilFence) {
        if (/^```/.test(line)) {
          skipUntilFence = false;
        }
        continue;
      }

      // Linhas de instruções internas do tipo "Instruções: ...", "Interno: ...", "Não mostrar: ..."
      if (/^\s*(instru[cç][aã]o(?:es)?|instruções|instrucoes|intern[oa]|não mostrar|nao mostrar)\b.*:/i.test(line)) {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() !== '' && /^\s+/.test(lines[j])) j++;
        i = j - 1;
        continue;
      }

      // Marcadores simples dentro de colchetes: [INTERNAL], [INSTRUÇÕES], etc.
      if (/^\s*\[.*(internal|instru).*\]\s*$/i.test(line)) {
        continue;
      }

      out.push(line);
    }
    return out.join('\n');
  };

  // 1) Sanitizar instruções internas
  let sanitized = stripInternalNotes(processedText);

  const lines = sanitized.split('\n');

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

  // Melhorar formatação de listas e títulos
  const rest = lines.slice(i).map((line, index) => {
    let l = line;
    
    // Converter ". " em bullet real
    if (/^\s*\.\s+/.test(l)) {
      l = l.replace(/^\s*\.\s+/, '- ');
    }
    
    // Garantir espaço após número do item: 1.Texto -> 1. Texto
    l = l.replace(/^(\s*)(\d+)\.(\S)/, '$1$2. $3');
    
    // Detectar títulos seguidos de listas e converter para formato inline
    const nextLine = index + 1 < lines.slice(i).length ? lines.slice(i)[index + 1] : '';
    const isTitle = /^[A-Z][^:]*:?\s*$/.test(l.trim()) && l.trim().length < 60;
    const nextIsList = /^\s*[-*+•]\s/.test(nextLine) || /^\s*\d+\.\s/.test(nextLine);
    
    if (isTitle && nextIsList) {
      // Converter título para negrito se seguido de lista
      const title = l.trim().replace(/:$/, '');
      return `**${title}:**`;
    }
    
    return l;
  });

  // Normalizar espaçamento - mais compacto como solicitado
  const normalized: string[] = [];
  for (let j = 0; j < rest.length; j++) {
    const curr = rest[j];
    const prev = normalized[normalized.length - 1] ?? '';
    
    // Não adicionar linha em branco antes de listas se o anterior for um título em negrito
    const startsList = /^(\s*)([-*+]\s|\d+\.\s)/.test(curr.trim());
    const prevIsBoldTitle = /^\*\*.*\*\*:?\s*$/.test(prev.trim());
    
    if (startsList && prev.trim() !== '' && !prevIsBoldTitle && !/^(\s*)([-*+]\s|\d+\.\s)/.test(prev.trim())) {
      normalized.push('');
    }
    normalized.push(curr);
  }

  // Reduzir espaçamentos exagerados - máximo 1 linha em branco
  const finalText = normalized.join('\n').replace(/\n{3,}/g, '\n\n');

  return finalText;
}

export const MarkdownRenderer: React.FC<{ content: string }>= ({ content }) => {
  const processed = preprocessMarkdown(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="font-bold text-2xl mt-0 mb-1 leading-tight" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="font-semibold text-lg mt-1.5 mb-0.5 leading-snug" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="font-medium text-base mt-1 mb-0.5 leading-snug" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-0.5 leading-relaxed" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="mb-1 list-disc list-outside pl-4" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="mb-1 list-decimal list-outside pl-4" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
      }}
    >
      {processed}
    </ReactMarkdown>
  );
};
