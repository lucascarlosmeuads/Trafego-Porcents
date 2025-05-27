import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LoginPage } from "@/pages/Login"
import { ManagerRoutes } from "@/routes/ManagerRoutes"
import { ClienteRoutes } from "@/routes/ClienteRoutes"
import { ProtectedRoute } from "@/components/ProtectedRoute"

import { SiteDashboard } from '@/components/SiteDashboard'

function App() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cliente/*" element={<ClienteRoutes />} />
              <Route path="/sites" element={<SiteDashboard />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <ManagerRoutes />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
