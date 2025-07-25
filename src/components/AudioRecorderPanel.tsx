import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderPanelProps {
  onTranscriptionComplete: (text: string) => void;
}

export default function AudioRecorderPanel({ onTranscriptionComplete }: AudioRecorderPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      toast.success('🎤 Gravação iniciada!');
      setIsRecording(true);
    } catch (error) {
      toast.error('Erro ao acessar microfone');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioBlob(new Blob());
    toast.success('⏹️ Gravação finalizada!');
  };

  const transcribeAudio = async () => {
    setIsTranscribing(true);
    // Simulated transcription
    setTimeout(() => {
      onTranscriptionComplete('Exemplo de transcrição do áudio gravado...');
      setIsTranscribing(false);
      toast.success('✅ Transcrição concluída!');
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          🎤 Gravação de Áudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          {!isRecording ? (
            <Button onClick={startRecording} className="flex-1 bg-red-500 hover:bg-red-600">
              <Mic className="mr-2 h-4 w-4" />
              Gravar
            </Button>
          ) : (
            <Button onClick={stopRecording} className="flex-1">
              <Square className="mr-2 h-4 w-4" />
              Parar
            </Button>
          )}
          {audioBlob && (
            <Button onClick={transcribeAudio} disabled={isTranscribing} variant="outline">
              {isTranscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Transcrever
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}