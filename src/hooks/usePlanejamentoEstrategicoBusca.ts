import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratedCopy {
  id: string;
  headline: string;
  subheadline: string;
  copy: string;
  cta: string;
  style: string;
  createdAt: Date;
}

export const usePlanejamentoEstrategicoBusca = (emailCliente?: string) => {
  const [planejamento, setPlanejamento] = useState<string | null>(null);
  const [copiesExtraidas, setCopiesExtraidas] = useState<GeneratedCopy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);
  const { toast } = useToast();

  const buscarPlanejamento = async (email: string) => {
    setIsLoading(true);
    try {
      console.log('🔍 Buscando planejamento estratégico para:', email);
      
      const { data, error } = await supabase
        .from('briefings_cliente')
        .select('planejamento_estrategico')
        .eq('email_cliente', email)
        .single();

      if (error) {
        console.log('📝 Nenhum planejamento encontrado para:', email);
        return null;
      }

      if (data?.planejamento_estrategico) {
        console.log('✅ Planejamento encontrado!');
        setPlanejamento(data.planejamento_estrategico);
        setHasExistingPlan(true);
        
        // Extrair copies do planejamento
        const copies = extrairCopiesDoTexto(data.planejamento_estrategico);
        setCopiesExtraidas(copies);
        
        return data.planejamento_estrategico;
      }

      return null;
    } catch (error: any) {
      console.error('Erro ao buscar planejamento:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const extrairCopiesDoTexto = (texto: string): GeneratedCopy[] => {
    const copies: GeneratedCopy[] = [];
    
    try {
      // Dividir o texto por seções numeradas ou títulos
      const secoes = texto.split(/(?:\d+\.|\#)/);
      
      let copyIndex = 1;
      
      // Procurar por padrões de criativos/copies
      const regexPatterns = [
        /(?:creative?|criativ[oa]|post|copy|título|headline)[\s\S]*?(?=\n\n|\d+\.|$)/gi,
        /(?:titulo|título|headline)[\s:]*([^\n]+)[\s\S]*?(?:descri[çc][ãa]o|texto|copy)[\s:]*([^\n]+)/gi,
        /(?:\*{1,2}|#{1,3})\s*([^*#\n]+)[\s\S]*?(?=\*{1,2}|#{1,3}|\n\n|$)/gi
      ];

      regexPatterns.forEach(pattern => {
        const matches = [...texto.matchAll(pattern)];
        matches.forEach(match => {
          if (match[0] && match[0].length > 50) {
            const conteudo = match[0].trim();
            
            // Extrair título/headline (primeira linha ou texto em maiúsculas)
            const linhas = conteudo.split('\n').filter(l => l.trim());
            const headline = linhas.find(l => 
              l.includes('PARE') || 
              l.includes('DESCUBRA') || 
              l.includes('TRANSFORME') ||
              l.length > 10 && l.length < 80
            ) || linhas[0] || `Criativo ${copyIndex}`;

            // Gerar subheadline
            const subheadline = linhas.find(l => 
              l !== headline && 
              l.length > 15 && 
              l.length < 100 &&
              !l.includes('CTA:') &&
              !l.includes('Botão:')
            ) || 'Método comprovado e exclusivo';

            // Extrair CTA
            const ctaMatch = conteudo.match(/(?:cta|bot[ãa]o|clique|acesse)[\s:]*([^\n]+)/i);
            const cta = ctaMatch?.[1]?.trim() || 'QUERO COMEÇAR AGORA';

            // Limpar texto principal
            const copyText = conteudo
              .replace(headline, '')
              .replace(subheadline, '')
              .replace(ctaMatch?.[0] || '', '')
              .trim();

            copies.push({
              id: `plan-copy-${copyIndex}`,
              headline: headline.replace(/[*#]/g, '').trim(),
              subheadline: subheadline.replace(/[*#]/g, '').trim(),
              copy: copyText || conteudo,
              cta: cta.replace(/[*#]/g, '').trim(),
              style: 'Do Planejamento Estratégico',
              createdAt: new Date()
            });

            copyIndex++;
          }
        });
      });

      // Se não encontrou copies específicas, criar pelo menos uma genérica do planejamento
      if (copies.length === 0) {
        const linhas = texto.split('\n').filter(l => l.trim() && l.length > 10);
        if (linhas.length > 3) {
          copies.push({
            id: 'plan-copy-generic',
            headline: linhas[0]?.replace(/[*#]/g, '').trim() || 'Transforme Seu Negócio',
            subheadline: linhas[1]?.replace(/[*#]/g, '').trim() || 'Estratégia baseada no seu planejamento',
            copy: linhas.slice(2, Math.min(linhas.length, 8)).join('\n'),
            cta: 'COMEÇAR AGORA',
            style: 'Baseada no Planejamento',
            createdAt: new Date()
          });
        }
      }

      console.log(`📋 Extraídas ${copies.length} copies do planejamento`);
      return copies.slice(0, 5); // Máximo 5 copies
      
    } catch (error) {
      console.error('Erro ao extrair copies:', error);
      return [];
    }
  };

  useEffect(() => {
    if (emailCliente) {
      buscarPlanejamento(emailCliente);
    }
  }, [emailCliente]);

  return {
    planejamento,
    copiesExtraidas,
    hasExistingPlan,
    isLoading,
    buscarPlanejamento
  };
};