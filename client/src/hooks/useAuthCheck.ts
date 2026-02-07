import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

interface AuthStatus {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { id?: number; email?: string; name?: string; role?: string } | null;
  error: Error | null;
}

/**
 * Hook para verificar autenticação sem renderizar
 * Retorna status de auth sem fazer redirecionamentos
 */
export function useAuthCheck(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    error: null,
  });

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (!meQuery.isLoading) {
      setStatus({
        isLoading: false,
        isAuthenticated: !!meQuery.data,
        isAdmin: meQuery.data?.role === 'admin',
        user: meQuery.data ? {
          id: meQuery.data.id,
          email: meQuery.data.email || undefined,
          name: meQuery.data.name || undefined,
          role: meQuery.data.role
        } : null,
        error: meQuery.error as Error | null,
      });
    }
  }, [meQuery.data, meQuery.isLoading, meQuery.error]);

  return status;
}

/**
 * Hook para forçar revalidação de autenticação
 */
export function useAuthRevalidate() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  return meQuery.refetch;
}
