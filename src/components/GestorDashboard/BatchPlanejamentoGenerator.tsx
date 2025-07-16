import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useBatchPlanejamentoEstrategico } from '@/hooks/useBatchPlanejamentoEstrategico';
import { 
  Zap, 
  Brain, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Sparkles 
} from 'lucide-react';

export function BatchPlanejamentoGenerator() {
  const { progress, generateAllPlans, resetProgress, getBriefingsWithoutPlan } = useBatchPlanejamentoEstrategico();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Carregar contagem inicial
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const briefings = await getBriefingsWithoutPlan();
        setPendingCount(briefings.length);
      } catch (error) {
        console.error('Erro ao carregar contagem:', error);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadPendingCount();
  }, []);

  // Atualizar contagem após o processamento
  useEffect(() => {
    if (!progress.processing && progress.total > 0) {
      const newPendingCount = Math.max(0, pendingCount - progress.completed);
      setPendingCount(newPendingCount);
    }
  }, [progress.processing, progress.completed, progress.total]);

  const progressPercentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            <span className="ml-2 text-white">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não há pendências e não está processando, não mostrar o card
  if (pendingCount === 0 && !progress.processing && progress.total === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <div className="p-2 bg-purple-600/30 rounded-lg">
            <Brain className="h-6 w-6 text-purple-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Gerador de Planejamentos IA</h3>
            <p className="text-sm text-purple-200 font-normal">
              Gere todos os planejamentos estratégicos pendentes
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-800/30 p-3 rounded-lg border border-purple-600/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-300" />
              <span className="text-sm text-purple-200">Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {progress.processing ? progress.total - progress.completed : pendingCount}
            </div>
          </div>
          
          {progress.processing && (
            <div className="bg-green-800/30 p-3 rounded-lg border border-green-600/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-300" />
                <span className="text-sm text-green-200">Concluídos</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {progress.completed}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar - apenas durante processamento */}
        {progress.processing && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-200">
                Progresso: {progress.completed}/{progress.total}
              </span>
              <Badge variant="secondary" className="bg-purple-600/30 text-purple-200">
                {progressPercentage}%
              </Badge>
            </div>
            
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-purple-900/50"
            />
            
            {progress.current && (
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <Clock className="h-3 w-3" />
                <span>Processando: {progress.current}</span>
              </div>
            )}
          </div>
        )}

        {/* Botão Principal */}
        <div className="flex gap-3">
          <Button
            onClick={generateAllPlans}
            disabled={progress.processing || pendingCount === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            size="lg"
          >
            {progress.processing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Gerando... ({progress.completed}/{progress.total})
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Todos os Planejamentos ({pendingCount})
              </>
            )}
          </Button>
          
          {(progress.total > 0 || progress.processing) && (
            <Button
              onClick={resetProgress}
              disabled={progress.processing}
              variant="outline"
              className="border-purple-500/50 text-purple-200 hover:bg-purple-600/20"
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Resultado Final */}
        {!progress.processing && progress.total > 0 && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>{progress.completed} sucessos</span>
              </div>
              
              {progress.errors > 0 && (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span>{progress.errors} erros</span>
                </div>
              )}
              
              <Badge variant="secondary" className="bg-purple-600/30 text-purple-200">
                {Math.round((progress.completed / progress.total) * 100)}% de sucesso
              </Badge>
            </div>
          </div>
        )}

        {/* Instrução */}
        {!progress.processing && pendingCount > 0 && (
          <div className="text-xs text-purple-300 bg-purple-900/20 p-3 rounded-lg border border-purple-600/20">
            <Zap className="h-3 w-3 inline mr-1" />
            Este processo gerará planejamentos estratégicos personalizados usando IA para todos os clientes que completaram o briefing.
          </div>
        )}
      </CardContent>
    </Card>
  );
}