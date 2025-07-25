import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AudioRecorderPanelProps {
  onTranscriptionComplete: (text: string) => void;
}

export default function AudioRecorderPanel({ onTranscriptionComplete }: AudioRecorderPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      console.log('🎤 [AudioRecorder] Iniciando gravação...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        console.log('🎵 [AudioRecorder] Gravação finalizada, tamanho:', blob.size);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      toast.success('🎤 Gravação iniciada!');
      
    } catch (error) {
      console.error('❌ [AudioRecorder] Erro ao iniciar gravação:', error);
      toast.error('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('⏹️ Gravação finalizada!');
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      toast.error('Nenhum áudio para transcrever');
      return;
    }

    setIsTranscribing(true);
    
    try {
      console.log('🔄 [AudioRecorder] Iniciando transcrição...');
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onload = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          console.log('📤 [AudioRecorder] Enviando áudio para transcrição, tamanho:', base64Audio.length);
          
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio }
          });

          if (error) {
            console.error('❌ [AudioRecorder] Erro na transcrição:', error);
            throw error;
          }

          console.log('✅ [AudioRecorder] Transcrição recebida:', data.text?.substring(0, 100));
          
          onTranscriptionComplete(data.text);
          toast.success('✅ Transcrição concluída!');
          
        } catch (error) {
          console.error('💥 [AudioRecorder] Erro no processamento:', error);
          toast.error('Erro na transcrição. Tente novamente.');
        } finally {
          setIsTranscribing(false);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ [AudioRecorder] Erro ao ler arquivo');
        toast.error('Erro ao processar áudio');
        setIsTranscribing(false);
      };
      
    } catch (error) {
      console.error('💥 [AudioRecorder] Erro na transcrição:', error);
      toast.error('Erro na transcrição. Tente novamente.');
      setIsTranscribing(false);
    }
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
            <Button 
              onClick={startRecording} 
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={isTranscribing}
            >
              <Mic className="mr-2 h-4 w-4" />
              Gravar
            </Button>
          ) : (
            <Button onClick={stopRecording} className="flex-1 bg-gray-500 hover:bg-gray-600">
              <Square className="mr-2 h-4 w-4" />
              Parar
            </Button>
          )}
          {audioBlob && !isRecording && (
            <Button 
              onClick={transcribeAudio} 
              disabled={isTranscribing} 
              variant="outline"
              className="flex-1"
            >
              {isTranscribing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isTranscribing ? 'Transcrevendo...' : 'Transcrever'}
            </Button>
          )}
        </div>
        
        {audioBlob && (
          <div className="text-sm text-muted-foreground">
            ✅ Áudio gravado ({(audioBlob.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </CardContent>
    </Card>
  );
}