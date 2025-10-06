import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Essential pages only
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";

// Essential components only
import Navigation from "@/components/Navigation";
import AuthGuard from "@/components/AuthGuard";

// Essential layouts
import CustomerLayout from "@/components/CustomerLayout";
import CustomerConsole from "@/pages/CustomerConsole";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/blog" component={Blog} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      
      {/* Authentication routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes - Client Portal */}
      <Route path="/client-portal">
        <AuthGuard requiredRole={['customer', 'client']}>
          <CustomerLayout>
            <CustomerConsole />
          </CustomerLayout>
        </AuthGuard>
      </Route>
      
      {/* Home route */}
      <Route path="/">
        {isLoading ? (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : isAuthenticated ? (
          <Home />
        ) : (
          <Landing />
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Check if we're on auth pages or client portal pages
  const isAuthPage = location === "/login" || location === "/register";
  const isClientPortalPage = location.startsWith("/client-portal");

  // Render different layouts for auth vs non-auth pages
  if (isAuthPage) {
    // Simple layout for auth pages
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <main>
              <Router />
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Client portal pages - use CustomerLayout (no public navigation)
  if (isClientPortalPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <main>
              <Router />
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Full layout for all other pages
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <main>
            <Router />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
