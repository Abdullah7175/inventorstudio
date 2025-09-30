import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string[];
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    // Check if user just logged out
    const userLoggedOut = sessionStorage.getItem('userLoggedOut');
    if (userLoggedOut === 'true') {
      // User just logged out, don't redirect again
      sessionStorage.removeItem('userLoggedOut');
      return;
    }

    // Check if we're already on the redirect page to prevent loops
    const currentPath = window.location.pathname;
    if (currentPath === redirectTo && !isAuthenticated) {
      return; // Already on login page and not authenticated, don't redirect
    }

    if (!isAuthenticated && !hasRedirected) {
      // User not authenticated, redirect to login
      setHasRedirected(true);
      setLocation(redirectTo);
      return;
    }

    if (requiredRole && user && !hasRedirected) {
      // Check if user has required role
      const hasRequiredRole = requiredRole.includes(user.role);
      if (!hasRequiredRole) {
        // User doesn't have required role, redirect to appropriate portal
        setHasRedirected(true);
        if (user.role === 'team') {
          setLocation('/team');
        } else if (user.role === 'customer' || user.role === 'client') {
          setLocation('/client-portal');
        } else {
          setLocation('/');
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, redirectTo, setLocation, hasRedirected]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user && !requiredRole.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
