import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { queryClient } from '@/lib/queryClient';

export function useSessionTimeout(timeoutMinutes: number = 30) {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = () => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        // Check if user has been inactive for the specified time
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        const timeoutMs = timeoutMinutes * 60 * 1000;
        
        if (timeSinceLastActivity >= timeoutMs) {
          // Use a different logout method for session timeout
          handleSessionTimeout();
        }
      }, timeoutMinutes * 60 * 1000);
    }
  };

  const handleSessionTimeout = async () => {
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
      console.error('Session timeout logout API error:', error);
    } finally {
      // CRITICAL FIX: Preserve logout flags during session timeout cleanup
      const logoutFlags = {
        userLoggedOut: sessionStorage.getItem('userLoggedOut'),
        logoutInProgress: sessionStorage.getItem('logoutInProgress')
      };
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Restore logout flags immediately
      sessionStorage.setItem('userLoggedOut', logoutFlags.userLoggedOut || 'true');
      sessionStorage.setItem('logoutInProgress', 'false'); // Session timeout is complete
      
      // Clear all cookies manually
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear React Query cache completely
      queryClient.clear();
      queryClient.removeQueries();
      
      // Force a hard reload to clear all state and go to login page
      window.location.replace("/login");
    }
  };

  const handleActivity = () => {
    resetTimeout();
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Set up activity listeners
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      // Initial timeout setup
      resetTimeout();

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isAuthenticated, timeoutMinutes]);

  return { resetTimeout };
}
