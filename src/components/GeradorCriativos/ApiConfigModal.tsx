import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ApiConfigManager, ImageProvider } from '@/services/apiConfig';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [runwayKey, setRunwayKey] = useState('');
  const [imageProvider, setImageProvider] = useState<ImageProvider>('openai');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = ApiConfigManager.getInstance();
      setOpenaiKey(config.getOpenAIKey());
      setRunwayKey(config.getRunwayKey());
      setImageProvider(config.getImageProvider());
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const config = ApiConfigManager.getInstance();
      await config.saveToDatabase(openaiKey, runwayKey, imageProvider);
      toast.success('Configurações salvas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error saving API config:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar APIs</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="openai-key">API do GPT (OpenAI)</Label>
            <Input
              id="openai-key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="runway-key">API do UNArray (Runway)</Label>
            <Input
              id="runway-key"
              type="password"
              value={runwayKey}
              onChange={(e) => setRunwayKey(e.target.value)}
              placeholder="rw-..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="image-provider">Provedor de Imagem</Label>
            <Select value={imageProvider} onValueChange={(value: ImageProvider) => setImageProvider(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">GPT (OpenAI)</SelectItem>
                <SelectItem value="runway">Runway (UNArray)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
            <strong>Observação:</strong> A análise de documentos será sempre feita via API do GPT.
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar API'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};