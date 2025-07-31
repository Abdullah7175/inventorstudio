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
        // User is signed out, remove auth header
        queryClient.setQueryDefaults([], {
          queryFn: ({ queryKey }) => {
            const [url] = queryKey as [string];
            return fetch(url, {
              credentials: 'include',
            }).then(async (res) => {
              if (!res.ok) {
                if (res.status === 401) {
                  throw new Error(`401: ${res.statusText}`);
                }
                throw new Error(`${res.status}: ${res.statusText}`);
              }
              return res.json();
            });
          },
        });

        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    });

    return () => unsubscribe();
  }, []);
}