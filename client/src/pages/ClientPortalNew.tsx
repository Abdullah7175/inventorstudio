import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Star,
  User,
  DollarSign
} from "lucide-react";
import ServiceCart from "@/components/ServiceCart";
import ProjectTracker from "@/components/ProjectTracker";
import ChatFileCenter from "@/components/ChatFileCenter";

interface Invoice {
  id: number;
  invoiceNumber: string;
  total: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ClientPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: projects = [], error: projectsError } = useQuery<Project[]>({
    queryKey: ["/api/client/projects"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/client/invoices"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (projectsError && isUnauthorizedError(projectsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [projectsError, toast]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500";
      case "approved": case "active": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "paid": return "bg-green-500";
      case "unpaid": return "bg-red-500";
      case "overdue": return "bg-red-600";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "approved": case "active": return <AlertCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "paid": return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20 pb-16">
          <div className="mobile-container">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-16">
        <div className="mobile-container space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold">
              Welcome back, {(user as any)?.firstName || 'Client'}!
            </h1>
            <p className="text-muted-foreground">
              Manage your projects, track progress, and communicate with your team.
            </p>
          </div>

          {/* Portal Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mobile-button">
              <TabsTrigger value="overview" className="text-xs lg:text-sm">
                <FileText className="h-4 w-4 mr-1 lg:mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="services" className="text-xs lg:text-sm">
                <ShoppingCart className="h-4 w-4 mr-1 lg:mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs lg:text-sm">
                <User className="h-4 w-4 mr-1 lg:mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs lg:text-sm">
                <MessageSquare className="h-4 w-4 mr-1 lg:mr-2" />
                Chat & Files
              </TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs lg:text-sm">
                <CreditCard className="h-4 w-4 mr-1 lg:mr-2" />
                Invoices
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Projects
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projects.filter((p: any) => p.status === "active").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently in progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Invoices
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {invoices.filter((i: any) => i.status === "unpaid").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting payment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Projects
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projects.length}</div>
                    <p className="text-xs text-muted-foreground">
                      All time projects
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No projects yet. Start by browsing our services!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {projects.slice(0, 3).map((project: any) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {project.projectName}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(project.status)} text-white`}
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(project.status)}
                              {project.status}
                            </span>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Cart Tab */}
            <TabsContent value="services">
              <ServiceCart />
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <ProjectTracker />
            </TabsContent>

            {/* Chat & Files Tab */}
            <TabsContent value="chat" className="space-y-6">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground">
                      Start a project to communicate with your team and share files.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Project Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Project for Communication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {projects.map((project: any) => (
                          <Button
                            key={project.id}
                            variant={selectedProjectId === project.id ? "default" : "outline"}
                            onClick={() => setSelectedProjectId(project.id)}
                            className="h-auto p-4 flex-col gap-2 mobile-button"
                          >
                            <span className="font-medium">{project.projectName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {project.status}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chat & File Center */}
                  {selectedProjectId && (
                    <ChatFileCenter projectId={selectedProjectId} />
                  )}
                </>
              )}
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Your Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No invoices yet. Invoices will appear here once your projects begin.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {invoices.map((invoice: Invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">
                                Invoice #{invoice.invoiceNumber}
                              </h4>
                              <Badge 
                                variant="secondary" 
                                className={`${getStatusColor(invoice.status)} text-white`}
                              >
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(invoice.status)}
                                  {invoice.status}
                                </span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Amount: ${invoice.total}</span>
                              <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="mobile-button">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            {invoice.status === "unpaid" && (
                              <Button size="sm" className="mobile-button">
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}