
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { TrafficManagementForm } from './TrafficManagementForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Sparkles } from 'lucide-react'

interface BriefingFormProps {
  onBriefingUpdated: () => void
  onBack?: () => void
}

export function BriefingForm({ onBriefingUpdated, onBack }: BriefingFormProps) {
  const { user } = useAuth()
  const { briefing, loading } = useClienteData(user?.email || '')

  console.log('🔍 [BriefingForm] === DEBUGGING BRIEFING FORM ===')
  console.log('📧 [BriefingForm] Email do cliente:', user?.email)
  console.log('📋 [BriefingForm] Briefing recebido:', briefing)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    )
  }

  return (
    <TrafficManagementForm
      briefing={briefing}
      emailCliente={user?.email || ''}
      onBriefingUpdated={onBriefingUpdated}
      onBack={onBack}
    />
  )
}
