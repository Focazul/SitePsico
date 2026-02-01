import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  useEffect(() => {
    // If query is done loading and no user data
    if (!meQuery.isLoading && !meQuery.data) {
      console.log('[ProtectedRoute] No user data, redirecting to /login');
      setRedirecting(true);
      setLocation('/login');
      return;
    }
    
    // If user exists but not admin and admin required
    if (meQuery.data && adminOnly && meQuery.data.role !== 'admin') {
      console.log('[ProtectedRoute] User is not admin, redirecting to /');
      setRedirecting(true);
      setLocation('/');
      return;
    }

    // Successfully authenticated and authorized
    if (meQuery.data && (!adminOnly || meQuery.data.role === 'admin')) {
      console.log('[ProtectedRoute] User authenticated and authorized, allowing access');
      setRedirecting(false);
    }
  }, [meQuery.data, meQuery.isLoading, adminOnly, setLocation]);

  // Loading state
  if (meQuery.isLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // User authenticated and authorized
  if (meQuery.data && (!adminOnly || meQuery.data.role === 'admin')) {
    return <>{children}</>;
  }

  // Fallback (shouldn't reach here)
  return null;
}
