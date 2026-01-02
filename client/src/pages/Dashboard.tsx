import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-8">
      <Card className="max-w-2xl mx-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo, {user?.name || 'Usuário'}!</h1>
          <p className="text-slate-600 mb-6">Email: {user?.email}</p>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Funcionalidades</h2>
              <p className="text-slate-600">Painel em desenvolvimento...</p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => logout()}
                variant="outline"
              >
                Sair
              </Button>
              <Button
                onClick={() => setLocation('/')}
                variant="ghost"
              >
                Voltar ao site
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
