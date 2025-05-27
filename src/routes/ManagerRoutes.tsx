
import { Routes, Route } from 'react-router-dom'
import { Dashboard } from '@/components/Dashboard'

export function ManagerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/*" element={<Dashboard />} />
    </Routes>
  )
}
