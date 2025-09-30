import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { logoutUser } from "@/lib/auth";

export function useAuth() {
  // Check if user just logged out to prevent unnecessary API calls
  const userLoggedOut = sessionStorage.getItem('userLoggedOut');
  
  // Get user from backend (which validates JWT token)
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
    enabled: userLoggedOut !== 'true', // Don't fetch if user just logged out
  });

  // If user just logged out, return null user and not authenticated
  if (userLoggedOut === 'true') {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: async () => {},
      refetch: async () => null,
    };
  }

  const logout = async () => {
    // Prevent multiple logout calls
    if (sessionStorage.getItem('logoutInProgress')) {
      return;
    }
    
    sessionStorage.setItem('logoutInProgress', 'true');
    
    try {
      // Call logout API to clear server session and blacklist token
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies manually
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear React Query cache completely
      queryClient.clear();
      queryClient.removeQueries();
      
      // Set a flag to prevent auto-redirect after logout
      sessionStorage.setItem('userLoggedOut', 'true');
      
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        // Force a hard reload to clear all state and go to login page
        window.location.replace("/login");
      }, 100);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refetch,
  };
}
