import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { reformatSinglePlan } from '@/utils/reformatSinglePlan';

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
  const [isFormatting, setIsFormatting] = useState(false);
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
          .update({ planejamento_estrategico: finalContent, status_negociacao: 'planejando' })
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

  const handleFormat = async () => {
    if (!emailCliente) {
      toast({ title: 'Email do cliente ausente', description: 'Não foi possível formatar sem email do cliente.', variant: 'destructive' });
      return;
    }
    setIsFormatting(true);
    try {
      const formatted = await reformatSinglePlan(emailCliente);
      setDraft(formatted);
      setIsEditing(false);
      toast({ title: 'Formatado', description: 'Planejamento reformatado automaticamente.' });
    } catch (e: any) {
      console.error('Erro ao formatar planejamento:', e);
      toast({ title: 'Erro ao formatar', description: e.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-tight">
            planejamento estratégico feito por Lucas Carlos - Funil Magnético e Interativo
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            tráfego pago em troca de % sobre as vendas
          </p>
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
          <div className="max-w-none whitespace-pre-wrap break-words">
            <MarkdownRenderer content={draft || content} />
          </div>
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
              <Button variant="secondary" onClick={handleFormat} disabled={isFormatting || !emailCliente}>
                {isFormatting ? 'Formatando...' : 'Formatar'}
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
