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
  });

  useEffect(() => {
    // If query is done loading and no user data
    if (!meQuery.isLoading && !meQuery.data) {
      setRedirecting(true);
      setLocation('/login');
    }
    
    // If user exists but not admin and admin required
    if (meQuery.data && adminOnly && meQuery.data.role !== 'admin') {
      setRedirecting(true);
      setLocation('/');
    }
  }, [meQuery.data, meQuery.isLoading, adminOnly, setLocation]);

  // Loading state
  if (meQuery.isLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
