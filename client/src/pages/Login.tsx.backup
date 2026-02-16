import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [, setLocation] = useLocation();

  const utils = trpc.useContext();

  // Verificar se já está autenticado
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (meQuery.data && meQuery.data.role === 'admin') {
      console.log('[Login] User already authenticated, redirecting to dashboard');
      setLocation('/admin/dashboard');
    }
  }, [meQuery.data, setLocation]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      console.log('[Login] Login successful for user:', data.user?.email);
      setError('');
      setAttempts(0);
      void utils.auth.me.invalidate();
      
      // Pequeno delay para garantir que a sessão seja estabelecida
      setTimeout(() => {
        setLocation('/admin/dashboard');
      }, 500);
    },
    onError: (error) => {
      console.error('[Login] Login failed:', error.message);
      setAttempts(prev => prev + 1);
      
      // Mensagens de erro mais específicas
      if (error.message.includes('inválidos')) {
        const remaining = Math.max(0, 5 - attempts);
        setError(`Email ou senha inválidos. ${remaining > 0 ? `Tentativas restantes: ${remaining}` : 'Conta temporariamente bloqueada.'}`);
      } else if (error.message.includes('bloqueada')) {
        setError('Conta temporariamente bloqueada devido a múltiplas tentativas falhidas.');
      } else {
        setError(error.message || 'Erro ao fazer login. Tente novamente.');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha email e senha');
      return;
    }

    if (attempts >= 5) {
      setError('Muitas tentativas falhidas. Tente novamente em alguns minutos.');
      return;
    }

    console.log('[Login] Attempting login with email:', email);
    loginMutation.mutate({ email, password });
  const isBlocked = attempts >= 5;
  const isLoading = loginMutation.isPending || meQuery.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Painel Admin
            </h1>
            <p className="text-slate-600">
              Faça login para acessar o sistema
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isBlocked && (
            <Alert variant="destructive" className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Conta temporariamente bloqueada devido a múltiplas tentativas falhidas.
                Tente novamente em alguns minutos.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-900 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isBlocked}
                className="w-full h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-900 font-medium">
                  Senha
                </Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isBlocked}
                  className="w-full h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  disabled={isLoading || isBlocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isBlocked}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
