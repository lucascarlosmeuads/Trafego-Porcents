
import { DiagnosticProgress as ProgressType } from './DiagnosticTypes'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

interface DiagnosticProgressProps {
  progress: ProgressType
}

export function DiagnosticProgress({ progress }: DiagnosticProgressProps) {
  return (
    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-blue-900">{progress.step}</span>
            <span className="text-xs text-blue-700">{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>
      </div>
      <p className="text-sm text-blue-800">{progress.message}</p>
    </div>
  )
}
