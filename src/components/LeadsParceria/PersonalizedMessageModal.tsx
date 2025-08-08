import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PersonalizedMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  clientName?: string;
  phone?: string | null;
}

export const PersonalizedMessageModal: React.FC<PersonalizedMessageModalProps> = ({
  open,
  onOpenChange,
  message,
  clientName = 'Cliente',
  phone,
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: 'Mensagem copiada', description: 'Texto copiado para a área de transferência.' });
    } catch (e) {
      toast({ title: 'Falha ao copiar', description: 'Não foi possível copiar o texto.', variant: 'destructive' });
    }
  };

  const waText = encodeURIComponent(message);
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const phoneWithCountry = cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`) : '';
  const waUrl = phoneWithCountry
    ? `https://wa.me/${phoneWithCountry}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mensagem personalizada para {clientName}</DialogTitle>
          <DialogDescription>
            Revise a mensagem abaixo e envie pelo WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            className="w-full h-56 rounded-md border bg-background p-3 text-sm"
            readOnly
            value={message}
          />
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" onClick={handleCopy}>Copiar</Button>
            <Button onClick={() => window.open(waUrl, '_blank')}>Abrir WhatsApp</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
