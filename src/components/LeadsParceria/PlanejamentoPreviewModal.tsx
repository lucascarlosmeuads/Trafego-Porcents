import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PlanejamentoPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  title?: string;
  emailCliente?: string;
  onApproved?: (finalContent: string) => void;
}

export const PlanejamentoPreviewModal: React.FC<PlanejamentoPreviewModalProps> = ({
  isOpen,
  onOpenChange,
  content,
  title = 'Planejamento Estratégico',
  emailCliente,
  onApproved,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    if (isOpen) setDraft(content);
  }, [isOpen, content]);

  const handleApprove = async () => {
    const finalContent = draft?.trim() || content;
    setIsPublishing(true);
    try {
      if (emailCliente) {
        const { error } = await supabase
          .from('formularios_parceria')
          .update({ planejamento_estrategico: finalContent, status_negociacao: 'planejamento_entregue' })
          .eq('email_usuario', emailCliente);
        if (error) throw error;
      }

      onApproved?.(finalContent);
      toast({ title: 'Publicado!', description: 'Planejamento aprovado e publicado no painel do cliente.' });
      onOpenChange(false);
    } catch (e: any) {
      console.error('Erro ao publicar planejamento:', e);
      toast({ title: 'Erro ao publicar', description: e.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[50vh]"
            />
          </div>
        ) : (
          <article className="prose prose-sm sm:prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft || content}</ReactMarkdown>
          </article>
        )}

        <DialogFooter className="mt-4">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => {
                if (isEditing) setDraft(content);
                setIsEditing((v) => !v);
              }}>
                {isEditing ? 'Cancelar edição' : 'Editar'}
              </Button>
              {isEditing && (
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Salvar alterações
                </Button>
              )}
            </div>
            <Button onClick={handleApprove} disabled={isPublishing}>
              {isPublishing ? 'Publicando...' : 'Aprovar e Publicar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
