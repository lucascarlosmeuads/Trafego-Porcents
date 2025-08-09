
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRecoveryTemplate, DEFAULT_RECOVERY_TEMPLATE } from '@/hooks/useRecoveryTemplate';
import { applyTemplate } from '@/utils/templateUtils';

export const RecoveryMessageSettings: React.FC = () => {
  const { template, setTemplate, saveTemplate, loading, saving } = useRecoveryTemplate('leads_parceria');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const exampleVars = useMemo(() => ({
    nome: 'Cliente Exemplo',
    primeiro_nome: 'Cliente',
    tipo_negocio: 'serviço',
  }), []);

  const preview = useMemo(() => applyTemplate(template || DEFAULT_RECOVERY_TEMPLATE, exampleVars), [template, exampleVars]);

  const handleSave = async () => {
    try {
      await saveTemplate(template);
      toast({ title: 'Template salvo', description: 'Sua mensagem de recuperação foi atualizada.' });
      setOpen(false);
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message || 'Não foi possível salvar.', variant: 'destructive' });
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Configurar mensagem
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mensagem de recuperação</DialogTitle>
            <DialogDescription>
              Edite o texto que será usado ao clicar no botão "Recuperar" nos leads. Variáveis disponíveis: 
              {' '}<code className="px-1">{"{{nome}}"}</code>,{' '}
              <code className="px-1">{"{{primeiro_nome}}"}</code>,{' '}
              <code className="px-1">{"{{tipo_negocio}}"}</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Textarea
              className="min-h-[140px]"
              placeholder={DEFAULT_RECOVERY_TEMPLATE}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              disabled={loading || saving}
            />
            <div className="rounded-md border p-3 bg-muted/40">
              <div className="text-xs text-muted-foreground mb-1">Pré-visualização</div>
              <div className="text-sm whitespace-pre-wrap">{preview}</div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplate(DEFAULT_RECOVERY_TEMPLATE)} disabled={saving}>
                Restaurar padrão
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
