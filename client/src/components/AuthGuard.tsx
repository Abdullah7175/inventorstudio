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
    console.log('AuthGuard useEffect:', { isLoading, isAuthenticated, userRole: user?.role, hasRedirected });
    
    if (isLoading) return; // Wait for auth check to complete

    // Enhanced logout detection
    const userLoggedOut = sessionStorage.getItem('userLoggedOut');
    const logoutInProgress = sessionStorage.getItem('logoutInProgress');
    const recentLogin = sessionStorage.getItem('recentLogin');
    
    console.log('AuthGuard flags:', { userLoggedOut, logoutInProgress, recentLogin });
    
    // CRITICAL: If user just logged out, don't redirect - let them stay on login page
    if (userLoggedOut === 'true' || logoutInProgress === 'true') {
      console.log('🚫 AuthGuard: User just logged out or logout in progress, preventing redirect');
      return;
    }

    // Check if we're already on the redirect page to prevent loops
    const currentPath = window.location.pathname;
    if (currentPath === redirectTo && !isAuthenticated) {
      return; // Already on login page and not authenticated, don't redirect
    }

    if (!isAuthenticated && !hasRedirected) {
      // User not authenticated, redirect to login
      console.log('AuthGuard: User not authenticated, redirecting to login');
      setHasRedirected(true);
      setLocation(redirectTo);
      return;
    }

    if (requiredRole && user && !hasRedirected) {
      // Check if user has required role
      const hasRequiredRole = requiredRole.includes(user.role);
      
      // Special case: SEO Expert team members can access SEO routes
      const isSEOExpert = user.teamRole === 'SEO Expert';
      const hasSEORoleAccess = requiredRole.includes('seo') && isSEOExpert;
      
      const hasAccess = hasRequiredRole || hasSEORoleAccess;
      
      console.log('AuthGuard: Checking role', { 
        userRole: user.role, 
        teamRole: user.teamRole,
        requiredRole, 
        hasRequiredRole,
        isSEOExpert,
        hasSEORoleAccess,
        hasAccess
      });
      
      if (!hasAccess) {
        // User doesn't have required role, redirect to appropriate portal
        console.log('AuthGuard: User has wrong role, redirecting to appropriate portal');
        setHasRedirected(true);
        
        // Check if team member has SEO Expert role for SEO portal access
        const isSEOExpert = user.teamRole === 'SEO Expert';
        
        if (user.role === 'admin') {
          setLocation('/admin');
        } else if (user.role === 'seo' || isSEOExpert) {
          setLocation('/seo');
        } else if (user.role === 'team' || user.role === 'developer' || user.role === 'manager') {
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
  const hasRequiredRole = requiredRole ? requiredRole.includes(user?.role || '') : true;
  const isSEOExpert = user?.teamRole === 'SEO Expert';
  const hasSEORoleAccess = requiredRole?.includes('seo') && isSEOExpert;
  const hasAccess = hasRequiredRole || hasSEORoleAccess;
  
  if (!isAuthenticated || (requiredRole && user && !hasAccess)) {
    return null;
  }

  return <>{children}</>;
}
