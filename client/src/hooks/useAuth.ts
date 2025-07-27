import { useState, useEffect } from "react";

// Global auth state to prevent multiple calls
let hasCheckedAuth = false;
let authResult = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

export function useAuth() {
  const [auth, setAuth] = useState(authResult);

  useEffect(() => {
    // Only check auth once per page load
    if (hasCheckedAuth) {
      setAuth(authResult);
      return;
    }

    hasCheckedAuth = true;
    
    // Quick check without React Query to stop infinite loops
    fetch('/api/auth/user', { 
      credentials: 'include',
      cache: 'no-cache'
    })
    .then(async (response) => {
      if (response.ok) {
        const user = await response.json();
        authResult = {
          user,
          isLoading: false,
          isAuthenticated: true,
        };
      } else {
        authResult = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
      }
      setAuth(authResult);
    })
    .catch(() => {
      authResult = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
      setAuth(authResult);
    });
  }, []);

  return auth;
}
