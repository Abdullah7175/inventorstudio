import { Switch, Route } from "wouter";
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
import Certifications from "@/pages/Certifications";
import Partnerships from "@/pages/Partnerships";
import ClientPortal from "@/pages/ClientPortal";
import AdminPortal from "@/pages/AdminPortal";
import ProjectManagement from "@/pages/ProjectManagement";
import TeamPortal from "@/pages/TeamPortal";
import ClientPortalNew from "@/pages/ClientPortalNew";
import Setup from "@/pages/Setup";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import Navigation from "@/components/Navigation";
import RealTimeChatTest from "@/components/RealTimeChatTest";

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
      
      {/* Protected routes - Client Portal */}
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/client-portal-new" component={ClientPortalNew} />
      
      {/* Protected routes - Admin Portal */}
      <Route path="/admin" component={AdminPortal} />
      <Route path="/admin-portal" component={AdminPortal} />
      
      {/* Project Management Routes */}
      <Route path="/projects" component={ProjectManagement} />
      <Route path="/team" component={TeamPortal} />
      
      {/* Real-time Chat Test Route */}
      <Route path="/chat-test" component={RealTimeChatTest} />
      
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
