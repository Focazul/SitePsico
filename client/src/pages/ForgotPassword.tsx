import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setEmail('');
      setTimeout(() => setLocation('/login'), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao solicitar recuperação');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, digite seu email');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, digite um email válido');
      return;
    }

    requestResetMutation.mutate({ email });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Enviado!</h1>
              <p className="text-slate-600 mb-4">
                Se o email existe em nosso sistema, você receberá um link para recuperar sua senha.
              </p>
              <p className="text-sm text-slate-500">
                Redirecionando para login em 5 segundos...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Recuperar Senha
            </h1>
            <p className="text-slate-600">
              Digite seu email e enviaremos um link de recuperação
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
              <Label htmlFor="email" className="text-slate-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={requestResetMutation.isPending}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={requestResetMutation.isPending}
              className="w-full"
            >
              {requestResetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
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
