import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderOpen, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  MessageSquare,
  User,
  Calendar
} from "lucide-react";
import { type ClientProject } from "@shared/schema";

export default function ClientPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: projects = [], isLoading: projectsLoading, error } = useQuery<ClientProject[]>({
    queryKey: ["/api/client/projects"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "review":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-500";
      case "in-progress":
        return "bg-blue-500/20 text-blue-500";
      case "review":
        return "bg-yellow-500/20 text-yellow-500";
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
          <p className="text-muted-foreground">Loading client portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6">
          <AnimatedSection className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome back, <span className="gradient-text">{user?.firstName || "Client"}</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Track your projects, download files, and communicate with our team.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {projects.filter(p => p.status === "completed").length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="projects" className="space-y-8">
            <TabsList className="glass-effect border-border">
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <FolderOpen className="h-4 w-4 mr-2" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <AnimatedSection>
                {projectsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="glass-effect border-border">
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="glass-effect border-border">
                    <CardContent className="text-center py-12">
                      <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        You don't have any projects assigned yet. Contact us to get started!
                      </p>
                      <Button asChild className="bg-primary text-black hover:bg-primary/80">
                        <a href="/contact">Contact Us</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                      <AnimatedSection key={project.id} delay={index * 0.1}>
                        <Card className="glass-effect border-border hover:border-primary/50 transition-all duration-300">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(project.status)}
                                  <Badge variant="secondary" className={getStatusColor(project.status)}>
                                    {project.status.replace("-", " ").toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {project.description && (
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Created: {formatDate(project.createdAt)}
                              </div>
                            </div>

                            {project.files && project.files.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Files ({project.files.length})
                                </h4>
                                <div className="space-y-1">
                                  {project.files.slice(0, 3).map((file, fileIndex) => (
                                    <div key={fileIndex} className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground truncate">
                                        {file.includes('/') ? file.split('/').pop() : file}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-primary/20"
                                        onClick={() => window.open(file, '_blank')}
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  {project.files.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{project.files.length - 3} more files
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {project.feedback && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Your Feedback
                                </h4>
                                <p className="text-xs text-muted-foreground bg-white/5 p-2 rounded">
                                  {project.feedback}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </AnimatedSection>
                    ))}
                  </div>
                )}
              </AnimatedSection>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <AnimatedSection>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-lg">{user?.firstName} {user?.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-lg">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {user?.role || "Client"}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                        <p className="text-lg">{formatDate(user?.createdAt)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button asChild className="w-full bg-primary text-black hover:bg-primary/80">
                        <a href="/contact">Start New Project</a>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-black">
                        <a href="/services">View Our Services</a>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                        onClick={() => window.location.href = "/api/logout"}
                      >
                        Sign Out
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
