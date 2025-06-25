
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Termos from "./pages/Termos";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

console.log('🔍 [App] Componente App inicializado')

const queryClient = new QueryClient();

const App = () => {
  console.log('🔍 [App] Renderizando App com rotas')
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/termos" 
                element={
                  <div>
                    {console.log('🔍 [App] Renderizando rota /termos')}
                    <Termos />
                  </div>
                } 
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
};

export default App;
