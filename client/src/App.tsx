import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Certifications from "@/pages/Certifications";
import Partnerships from "@/pages/Partnerships";
import ClientPortal from "@/pages/ClientPortal";
// Admin portal removed for security
import ProjectManagement from "@/pages/ProjectManagement";
import TeamPortal from "@/pages/TeamPortal";
import ClientPortalNew from "@/pages/ClientPortalNew";
import Setup from "@/pages/Setup";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CustomerConsole from "@/pages/CustomerConsole";
import ClientProjects from "@/pages/ClientProjects";
import ClientMessages from "@/pages/ClientMessages";
import ClientProfile from "@/pages/ClientProfile";
import ClientSettings from "@/pages/ClientSettings";
import ApiDocumentation from "@/pages/ApiDocumentation";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import Navigation from "@/components/Navigation";
import RealTimeChatTest from "@/components/RealTimeChatTest";
import AuthGuard from "@/components/AuthGuard";
import CustomerLayout from "@/components/CustomerLayout";


function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes available to everyone */}
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/blog" component={Blog} />
      <Route path="/certifications" component={Certifications} />
      <Route path="/partnerships" component={Partnerships} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/api-docs" component={ApiDocumentation} />
      
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
      <Route path="/client-portal/projects">
        <AuthGuard requiredRole={['customer', 'client']}>
          <CustomerLayout>
            <ClientProjects />
          </CustomerLayout>
        </AuthGuard>
      </Route>
      <Route path="/client-portal/messages">
        <AuthGuard requiredRole={['customer', 'client']}>
          <CustomerLayout>
            <ClientMessages />
          </CustomerLayout>
        </AuthGuard>
      </Route>
      <Route path="/client-portal/profile">
        <AuthGuard requiredRole={['customer', 'client']}>
          <CustomerLayout>
            <ClientProfile />
          </CustomerLayout>
        </AuthGuard>
      </Route>
      <Route path="/client-portal/settings">
        <AuthGuard requiredRole={['customer', 'client']}>
          <CustomerLayout>
            <ClientSettings />
          </CustomerLayout>
        </AuthGuard>
      </Route>
      
      {/* Admin portal removed for security */}
      
      {/* Project Management Routes */}
      <Route path="/projects">
        <AuthGuard>
          <ProjectManagement />
        </AuthGuard>
      </Route>
      <Route path="/team" component={TeamPortal} />
      
      {/* Real-time Chat Test Route */}
      <Route path="/chat-test">
        <AuthGuard>
          <RealTimeChatTest />
        </AuthGuard>
      </Route>
      
      {/* Setup Route */}
      <Route path="/setup" component={Setup} />
      
      {/* Home route - show Landing for non-authenticated users, Home for authenticated */}
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Check if we're on auth pages or client portal pages
  const isAuthPage = location === "/login" || location === "/register";
  const isClientPortalPage = location.startsWith("/client-portal");

  // Clean up logout flags when navigating to non-auth pages
  React.useEffect(() => {
    if (!isAuthPage) {
      // Clear logout flags when not on auth pages
      sessionStorage.removeItem('userLoggedOut');
      sessionStorage.removeItem('logoutInProgress');
    }
  }, [location, isAuthPage]);

  // Render different layouts for auth vs non-auth pages
  if (isAuthPage) {
    // Simple layout for auth pages - no header, no footer, no animations
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
          <AddToHomeScreen />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
