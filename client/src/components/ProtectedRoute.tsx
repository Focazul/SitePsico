import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const meQuery = trpc.auth.me.useQuery();

  // Loading state
  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Not authenticated
  if (!meQuery.data) {
    setLocation('/login');
    return null;
  }

  // Check admin role if required
  if (adminOnly && meQuery.data.role !== 'admin') {
    setLocation('/');
    return null;
  }

  return <>{children}</>;
}
