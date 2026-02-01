import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setLocation('/login'), 3000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao resetar senha');
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Link de recuperação inválido ou expirado
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => setLocation('/forgot-password')}
              className="w-full mt-4"
            >
              Solicitar Novo Link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Senha Alterada!</h1>
              <p className="text-slate-600 mb-4">
                Sua senha foi redefinida com sucesso.
              </p>
              <p className="text-sm text-slate-500">
                Redirecionando para login em 3 segundos...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (newPassword.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Criar Nova Senha
            </h1>
            <p className="text-slate-600">
              Digite sua nova senha para acessar sua conta
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-900">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-slate-900">
                Confirmar Senha
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={resetPasswordMutation.isPending}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Lembrou a senha?{' '}
              <button
                onClick={() => setLocation('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Voltar ao Login
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
