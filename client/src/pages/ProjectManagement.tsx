import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/firebase";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ServiceCart from "@/components/ServiceCart";
import KanbanBoard from "@/components/KanbanBoard";
import AnimatedSection from "@/components/AnimatedSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { type ProjectRequest, type Invoice } from "@shared/schema";

export default function ProjectManagement() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("services");

  // Fetch user's project requests
  const { data: projectRequests = [] } = useQuery<ProjectRequest[]>({
    queryKey: ["/api/client/requests"],
    enabled: isAuthenticated,
  });

  // Fetch user's invoices
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/client/invoices"],
    enabled: isAuthenticated,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "approved":
        return "bg-green-500/20 text-green-500";
      case "in-progress":
        return "bg-blue-500/20 text-blue-500";
      case "completed":
        return "bg-green-500/20 text-green-500";
      case "rejected":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project management...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <AnimatedSection className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Project <span className="gradient-text">Management</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Manage your projects, track progress, and collaborate with our team.
              </p>
              <Button
                onClick={() => window.location.href = "/"}
                size="lg"
                className="bg-primary text-black hover:bg-primary/80"
              >
                Log In to Continue
              </Button>
            </AnimatedSection>
          </div>
        </section>
        <Footer showDesignRushBadge={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Project <span className="gradient-text">Management</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, {user ? (user as any).firstName || 'there' : 'there'}! Manage your projects and track progress.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="pb-8">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {projectRequests.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {projectRequests.filter(p => p.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {projectRequests.filter(p => p.status === "in-progress").length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    {invoices.filter(i => i.status === "unpaid").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Invoices</div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="glass-effect border-border">
              <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Request Services
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <FileText className="h-4 w-4 mr-2" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <DollarSign className="h-4 w-4 mr-2" />
                Invoices
              </TabsTrigger>
            </TabsList>

            {/* Service Cart Tab */}
            <TabsContent value="services">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">Request New Services</h2>
                <ServiceCart />
              </AnimatedSection>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">My Projects</h2>
                
                {projectRequests.length === 0 ? (
                  <Card className="glass-effect border-border">
                    <CardContent className="text-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by requesting services from our portfolio.
                      </p>
                      <Button onClick={() => setActiveTab("services")}>
                        Request Services
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {projectRequests.map((project) => (
                      <Card key={project.id} className="glass-effect border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">{project.projectName}</h3>
                                {getStatusIcon(project.status || "pending")}
                                <Badge variant="secondary" className={getStatusColor(project.status || "pending")}>
                                  {(project.status || "pending").replace("-", " ").toUpperCase()}
                                </Badge>
                              </div>
                              {project.description && (
                                <p className="text-muted-foreground mb-3">{project.description}</p>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-semibold">Budget:</span> {project.budget || "Not specified"}
                                </div>
                                <div>
                                  <span className="font-semibold">Timeline:</span> {project.timeline || "Not specified"}
                                </div>
                                <div>
                                  <span className="font-semibold">Created:</span> {formatDate(project.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Show Kanban board for approved/in-progress projects */}
                          {(project.status === "approved" || project.status === "in-progress") && (
                            <div className="mt-6 pt-6 border-t border-border">
                              <h4 className="text-lg font-semibold mb-4">Project Progress</h4>
                              <KanbanBoard projectId={project.id} isTeamView={true} />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AnimatedSection>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">Invoices</h2>
                
                {invoices.length === 0 ? (
                  <Card className="glass-effect border-border">
                    <CardContent className="text-center py-12">
                      <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Invoices Yet</h3>
                      <p className="text-muted-foreground">
                        Invoices will appear here once your projects are approved.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <Card key={invoice.id} className="glass-effect border-border">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                Invoice #{invoice.invoiceNumber}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Total: ${invoice.total}</span>
                                <span>Due: {formatDate(invoice.dueDate)}</span>
                                <span>Created: {formatDate(invoice.createdAt)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant="secondary" 
                                className={
                                  invoice.status === "paid" 
                                    ? "bg-green-500/20 text-green-500"
                                    : invoice.status === "overdue"
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-yellow-500/20 text-yellow-500"
                                }
                              >
                                {invoice.status?.toUpperCase()}
                              </Badge>
                              {invoice.status !== "paid" && (
                                <Button size="sm" className="mt-2">
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AnimatedSection>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer showDesignRushBadge={false} />
    </div>
  );
}