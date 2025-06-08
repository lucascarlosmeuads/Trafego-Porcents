
import { useState, useEffect } from 'react'
import { MetaAdsForm } from './MetaAdsForm'
import { MetaAdsReport } from './MetaAdsReport'
import { useMetaAds } from '@/hooks/useMetaAds'

export function MetaAdsGestor() {
  const { report, loadConfig } = useMetaAds()

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const handleReportGenerated = () => {
    // Força scroll para o relatório após geração
    setTimeout(() => {
      const reportElement = document.querySelector('[data-meta-ads-report]')
      if (reportElement) {
        reportElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Meta Ads Manager</h1>
        <p className="text-gray-300">
          Configure sua API e visualize os relatórios de suas campanhas Meta
        </p>
      </div>

      <MetaAdsForm onReportGenerated={handleReportGenerated} />

      {report && (
        <div data-meta-ads-report>
          <MetaAdsReport report={report} />
        </div>
      )}
    </div>
  )
}
