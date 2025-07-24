
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/components/Dashboard";
import { LoadingFallback } from "@/components/LoadingFallback";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default Index
