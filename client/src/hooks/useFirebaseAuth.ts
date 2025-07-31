import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { queryClient } from "@/lib/queryClient";

export function useFirebaseAuth() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, get the ID token and set up auth header
        const token = await user.getIdToken();
        
        // Update auth header for authenticated requests
        const authHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        
        // Store token for API requests
        (window as any).__authToken = token;

        // Invalidate auth queries to refetch with new token
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else {
        // User is signed out, clear all auth data
        (window as any).__authToken = null;
        
        // Clear all cached queries
        queryClient.clear();
        
        // Remove any stored auth data
        localStorage.removeItem('firebase:authUser');
        sessionStorage.clear();
      }
    });

    return () => unsubscribe();
  }, []);
}