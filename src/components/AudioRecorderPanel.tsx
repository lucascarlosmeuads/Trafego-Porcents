import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Upload, Loader2, FileAudio } from "lucide-react";
import { toast } from "sonner";
import { ApiConfigManager } from "@/services/apiConfig";

interface AudioRecorderPanelProps {
  onTranscriptionComplete: (transcription: string) => void;
}

export default function AudioRecorderPanel({ onTranscriptionComplete }: AudioRecorderPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [config] = useState(() => ApiConfigManager.getInstance());

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("🎙️ Gravação iniciada!");
    } catch (error) {
      toast.error("Erro ao acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("🛑 Gravação finalizada!");
    }
  };

  const transcribeAudio = async (audioFile: Blob) => {
    const openaiKey = config.getOpenAIKey();
    
    if (!openaiKey) {
      toast.error("Configure a chave OpenAI primeiro");
      return;
    }

    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('file', audioFile, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro na transcrição');
      }

      const result = await response.json();
      const transcriptionText = result.text;
      
      setTranscription(transcriptionText);
      onTranscriptionComplete(transcriptionText);
      toast.success("🎯 Áudio transcrito com sucesso!");
    } catch (error: any) {
      console.error('Erro na transcrição:', error);
      toast.error(error.message || "Erro ao transcrever áudio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioBlob(file);
        toast.success("📁 Arquivo de áudio carregado!");
      } else {
        toast.error("Por favor, selecione um arquivo de áudio válido");
      }
    }
  };

  const clearTranscription = () => {
    setTranscription("");
    setAudioBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            🎙️ Gravação e Transcrição de Áudio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Iniciar Gravação
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                  size="lg"
                >
                  <MicOff className="h-5 w-5 mr-2" />
                  Parar Gravação
                </Button>
              )}
            </div>

            {isRecording && (
              <div className="text-center">
                <div className="animate-pulse text-red-500 font-medium">
                  🔴 Gravando...
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Ou faça upload de um arquivo de áudio:</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo de Áudio
            </Button>
          </div>

          {/* Audio Controls */}
          {audioBlob && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4" />
                <span className="text-sm font-medium">Áudio pronto para transcrição</span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => transcribeAudio(audioBlob)}
                  disabled={isTranscribing}
                  className="flex-1"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transcrevendo...
                    </>
                  ) : (
                    <>
                      <FileAudio className="h-4 w-4 mr-2" />
                      Transcrever Áudio
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={clearTranscription}
                  variant="outline"
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="space-y-2">
              <Label>Transcrição:</Label>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                rows={6}
                className="bg-background border-border"
                placeholder="A transcrição aparecerá aqui..."
              />
              <div className="flex space-x-2">
                <Button
                  onClick={() => onTranscriptionComplete(transcription)}
                  className="flex-1"
                >
                  Usar Esta Transcrição
                </Button>
                <Button
                  onClick={clearTranscription}
                  variant="outline"
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📋 Como usar:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Grave áudio diretamente ou faça upload de um arquivo</li>
              <li>• A transcrição será feita automaticamente usando OpenAI Whisper</li>
              <li>• Você pode editar a transcrição antes de usá-la</li>
              <li>• Clique em "Usar Esta Transcrição" para preencher o campo de documento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}