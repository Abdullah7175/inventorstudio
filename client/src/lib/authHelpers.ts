import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { queryClient } from "@/lib/queryClient";

export async function performCompleteLogout() {
  try {
    // Clear all authentication tokens first
    (window as any).__authToken = null;
    
    // Clear Firebase auth state
    await signOut(auth);
    
    // Clear server-side sessions
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    
    // Clear all cached data
    queryClient.clear();
    
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies by setting expired date
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // Force page reload to clear all state
    window.location.replace("/");
    
  } catch (error) {
    console.error("Logout error:", error);
    // Force reload even if logout partially failed
    window.location.replace("/");
  }
}