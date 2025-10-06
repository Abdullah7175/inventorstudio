import React, { lazy, Suspense } from "react";
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
import SimpleTestComponent from "@/components/SimpleTestComponent";
// Admin Portal
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/users/UserManagement";
import AdminProjectManagement from "@/pages/admin/projects/ProjectManagement";
import CustomerManagement from "@/pages/admin/customers/CustomerManagement";
import TeamManagement from "@/pages/admin/teams/TeamManagement";
// Lazy load admin pages for better performance
const CommunicationManagement = lazy(() => import("@/pages/admin/communications/CommunicationManagement"));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/analytics/AnalyticsDashboard"));
const AdminSettings = lazy(() => import("@/pages/admin/settings/AdminSettings"));

// Team Portal imports
import TeamLayout from "@/pages/team/TeamLayout";
import TeamDashboard from "@/pages/team/TeamDashboard";
import TeamProjectManagement from "@/pages/team/TeamProjectManagement";
import TeamProfile from "@/pages/team/TeamProfile";

// Lazy load team portal pages for better performance
const TeamMembers = lazy(() => import("@/pages/team/TeamMembers"));
const TeamMessages = lazy(() => import("@/pages/team/TeamMessages"));
const TeamCalendar = lazy(() => import("@/pages/team/TeamCalendar"));
const TeamAnalytics = lazy(() => import("@/pages/team/TeamAnalytics"));
const TeamSettings = lazy(() => import("@/pages/team/TeamSettings"));

// SEO Portal imports
import SEOLayout from "@/pages/seo/SEOLayout";
import SEODashboard from "@/pages/seo/SEODashboard";
import ServicesManagement from "@/pages/seo/ServicesManagement";
import PortfolioManagement from "@/pages/seo/PortfolioManagement";
import FAQManagement from "@/pages/seo/FAQManagement";

// Lazy load SEO portal pages for better performance
const BlogManagement = lazy(() => import("@/pages/seo/BlogManagement"));
const CertificationsManagement = lazy(() => import("@/pages/seo/CertificationsManagement"));
const PartnershipsManagement = lazy(() => import("@/pages/seo/PartnershipsManagement"));
const SEOContentManagement = lazy(() => import("@/pages/seo/SEOContentManagement"));
const ContactMessagesManagement = lazy(() => import("@/pages/seo/ContactMessagesManagement"));
const SEOSettings = lazy(() => import("@/pages/seo/SEOSettings"));
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
      
      {/* Admin Portal Routes */}
      <Route path="/admin">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/users">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/projects">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <AdminProjectManagement />
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/customers">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <CustomerManagement />
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/teams/members">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <TeamManagement />
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/teams/roles">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <TeamManagement />
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/teams/workload">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <TeamManagement />
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/communications/chat">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <CommunicationManagement />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/communications/notifications">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <CommunicationManagement />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/communications/emails">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <CommunicationManagement />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AnalyticsDashboard />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics/revenue">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AnalyticsDashboard />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics/performance">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AnalyticsDashboard />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
        <Route path="/admin/settings">
          <AuthGuard requiredRole={['admin']}>
            <AdminLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <AdminSettings />
              </Suspense>
            </AdminLayout>
          </AuthGuard>
        </Route>

        {/* Team Portal Routes */}
        <Route path="/team">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <TeamDashboard />
            </TeamLayout>
          </AuthGuard>
        </Route>
        <Route path="/team/projects">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <TeamProjectManagement />
            </TeamLayout>
          </AuthGuard>
        </Route>
        <Route path="/team/profile">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <TeamProfile />
            </TeamLayout>
          </AuthGuard>
        </Route>
        <Route path="/team/team">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <TeamMembers />
              </Suspense>
            </TeamLayout>
          </AuthGuard>
        </Route>
        <Route path="/team/messages">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <TeamMessages />
              </Suspense>
            </TeamLayout>
          </AuthGuard>
        </Route>
        <Route path="/team/calendar">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <TeamCalendar />
              </Suspense>
            </TeamLayout>
          </AuthGuard>
        </Route>
        <Route path="/team/analytics">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <TeamAnalytics />
              </Suspense>
            </TeamLayout>
          </AuthGuard>
        </Route>
        <Route path="/team/settings">
          <AuthGuard requiredRole={['team', 'developer', 'manager']}>
            <TeamLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <TeamSettings />
              </Suspense>
            </TeamLayout>
          </AuthGuard>
        </Route>

        {/* SEO Portal Routes */}
        <Route path="/seo">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <SEODashboard />
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/services">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <ServicesManagement />
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/portfolio">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <PortfolioManagement />
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/blog">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <BlogManagement />
              </Suspense>
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/faq">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <FAQManagement />
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/certifications">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <CertificationsManagement />
              </Suspense>
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/partnerships">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <PartnershipsManagement />
              </Suspense>
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/content">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <SEOContentManagement />
              </Suspense>
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/contact-messages">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <ContactMessagesManagement />
              </Suspense>
            </SEOLayout>
          </AuthGuard>
        </Route>
        <Route path="/seo/settings">
          <AuthGuard requiredRole={['seo', 'admin']}>
            <SEOLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <SEOSettings />
              </Suspense>
            </SEOLayout>
          </AuthGuard>
        </Route>

      <Route path="/admin/settings/security">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminSettings />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
      <Route path="/admin/settings/integrations">
        <AuthGuard requiredRole={['admin']}>
          <AdminLayout>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminSettings />
            </Suspense>
          </AdminLayout>
        </AuthGuard>
      </Route>
      
      {/* Project Management Routes */}
      <Route path="/projects">
        <AuthGuard>
          <ProjectManagement />
        </AuthGuard>
      </Route>
      <Route path="/team">
        <AuthGuard requiredRole={['team', 'developer', 'manager', 'seo', 'admin']}>
          <TeamPortal />
        </AuthGuard>
      </Route>
      
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
  
  // Check if we're on auth pages, client portal pages, admin portal pages, or team portal pages
  const isAuthPage = location === "/login" || location === "/register";
  const isClientPortalPage = location.startsWith("/client-portal");
  const isAdminPortalPage = location.startsWith("/admin");
  const isTeamPortalPage = location.startsWith("/team");

  // Clean up logout flags when navigating to non-auth pages
  React.useEffect(() => {
    if (!isAuthPage) {
      // Clear logout flags when not on auth pages
      // BUT DON'T clear recentLogin flag - it's needed for auth validation
      sessionStorage.removeItem('userLoggedOut');
      sessionStorage.removeItem('logoutInProgress');
      // sessionStorage.removeItem('recentLogin'); // REMOVED - this was causing the redirect loop!
    }
  }, [location, isAuthPage]);

  // Check for stale sessions on app load - but give time for login process
  React.useEffect(() => {
    // Don't check immediately - give time for login process to complete
    const timeoutId = setTimeout(() => {
      const hasAuthCookie = document.cookie.includes('authToken=');
      const recentLogin = sessionStorage.getItem('recentLogin') === 'true';
      console.log('App load - checking for stale session:', { hasAuthCookie, recentLogin });
      
      // Define public routes that don't require authentication
      const publicRoutes = ['/', '/about', '/services', '/portfolio', '/blog', '/contact', '/faq', '/certifications', '/partnerships', '/privacy-policy', '/terms-of-service', '/api-docs'];
      const isPublicRoute = publicRoutes.includes(location);
      
      // If no auth cookie and no recent login, and we're on a protected route, redirect to login
      if (!hasAuthCookie && !recentLogin && !isAuthPage && !isPublicRoute) {
        console.log('No auth cookie found and no recent login, redirecting to login');
        window.location.replace('/login');
      }
    }, 2000); // Wait 2 seconds for login process to complete

    return () => clearTimeout(timeoutId);
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

  // Admin portal pages - use AdminLayout (no public navigation)
  if (isAdminPortalPage || isTeamPortalPage) {
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
