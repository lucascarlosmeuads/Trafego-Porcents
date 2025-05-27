
import { Routes, Route } from 'react-router-dom'
import { ClienteDashboard } from '@/components/ClienteDashboard'

export function ClienteRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<ClienteDashboard />} />
    </Routes>
  )
}
