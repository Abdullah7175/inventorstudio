import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { logoutUser } from "@/lib/auth";

export function useAuth() {
  // Check if user just logged out to prevent unnecessary API calls
  const userLoggedOut = sessionStorage.getItem('userLoggedOut');
  const logoutInProgress = sessionStorage.getItem('logoutInProgress');
  
  // Check if there's a cookie that might indicate a stale session
  const hasAuthCookie = document.cookie.includes('authToken=');
  
  // Additional check: if we have a recent login, give more time for cookie to be set
  const recentLogin = sessionStorage.getItem('recentLogin') === 'true';
  
  // Check if we already have cached user data to prevent unnecessary queries
  const cachedUser = queryClient.getQueryData(["/api/auth/user"]);
  const hasCachedUser = !!cachedUser;
  
  // If we have cached user data, that's also a valid auth indicator
  const hasValidAuth = hasAuthCookie || recentLogin || hasCachedUser;
  
  console.log('useAuth state:', { userLoggedOut, logoutInProgress, hasAuthCookie, hasCachedUser });
  
  // Memoize the enabled condition to prevent unnecessary re-evaluations
  const shouldFetchUser = useMemo(() => {
    // If user just logged out or logout is in progress, don't fetch
    if (userLoggedOut === 'true' || logoutInProgress === 'true') {
      console.log('🚫 Skipping fetch - user logged out or logout in progress');
      return false;
    }
    
    // Only fetch if we have valid auth indicators
    if (!hasValidAuth) {
      console.log('🚫 Skipping fetch - no valid auth indicators');
      return false;
    }
    
    console.log('✅ Fetching user data');
    return true;
  }, [userLoggedOut, logoutInProgress, hasValidAuth]);
  
  // Get user from backend (which validates JWT token)
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: Infinity, // Never consider data stale - prevent all automatic refetches
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchInterval: false, // Disable any interval refetching
    refetchIntervalInBackground: false, // Disable background refetching
    enabled: shouldFetchUser, // Use memoized condition to prevent unnecessary re-evaluations
  });

  // If user just logged out or logout is in progress, return null user and not authenticated
  if (userLoggedOut === 'true' || logoutInProgress === 'true') {
    console.log('Returning logged out state');
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: async () => {
        console.log('Logout already in progress or user already logged out');
      },
      refetch: async () => null,
    };
  }

  const logout = async () => {
    // Prevent multiple logout calls
    if (sessionStorage.getItem('logoutInProgress')) {
      console.log('Logout already in progress, skipping...');
      return;
    }
    
    console.log('Starting logout process...');
    
    // Immediately set flags to prevent any race conditions
    sessionStorage.setItem('logoutInProgress', 'true');
    sessionStorage.setItem('userLoggedOut', 'true');
    
    console.log('Logout flags set, clearing React Query cache...');
    
    // Immediately clear the user data from React Query cache
    queryClient.setQueryData(['/api/auth/user'], null);
    queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
    
    try {
      // Call logout API to clear server session and blacklist token
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Critical: include cookies so server can clear them
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Logout endpoint responded with', response.status, await response.text());
      } else {
        const result = await response.json();
        console.log('Logout successful:', result);
      }
    } catch (error) {
      console.error('Logout network error:', error);
      // Still proceed with client cleanup even if server call fails
    } finally {
      console.log('Logout cleanup starting...');
      
      // Clear React Query cache for user data completely (userLoggedOut already set above)
      queryClient.setQueryData(['/api/auth/user'], null);
      await queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      console.log('React Query cache cleared');
      
      // Clear all local storage
      localStorage.clear();
      
      // Clear ALL React Query cache to ensure no stale data
      queryClient.clear();
      
      // Clear all cookies manually (backup in case server cookie clearing fails)
      // Clear authToken cookie with multiple approaches
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname + ';';
      
      // Clear all other cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('Cookies cleared:', document.cookie);
      
      // CRITICAL FIX: Don't clear sessionStorage completely - preserve logout flags
      // Only clear specific items, not everything
      const logoutFlags = {
        userLoggedOut: sessionStorage.getItem('userLoggedOut'),
        logoutInProgress: sessionStorage.getItem('logoutInProgress')
      };
      
      // Clear sessionStorage except logout flags
      sessionStorage.clear();
      
      // Restore logout flags immediately
      sessionStorage.setItem('userLoggedOut', logoutFlags.userLoggedOut || 'true');
      sessionStorage.setItem('logoutInProgress', 'false'); // Logout is complete
      
      console.log('Logout flags preserved:', {
        userLoggedOut: sessionStorage.getItem('userLoggedOut'),
        logoutInProgress: sessionStorage.getItem('logoutInProgress')
      });
      
      console.log('Redirecting to login page...');
      
      // Use replace instead of href to prevent back button issues
      window.location.replace('/login');
    }
  };

  // Check for stale session - if user data exists but no valid auth AND not a recent login
  const isStaleSession = user && !hasValidAuth && !recentLogin;
  
  console.log('Stale session check:', { 
    hasUser: !!user, 
    hasAuthCookie, 
    recentLogin, 
    hasValidAuth,
    isStaleSession 
  });
  
  if (isStaleSession) {
    console.log('Detected stale session - user data exists but no valid auth and no recent login');
    // Clear the stale data and return logged out state
    queryClient.setQueryData(['/api/auth/user'], null);
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: async () => {
        console.log('Stale session detected, no logout needed');
      },
      refetch: async () => null,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refetch,
  };
}
