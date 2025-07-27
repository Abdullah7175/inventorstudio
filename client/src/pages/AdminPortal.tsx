import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import BlogManagement from "@/components/BlogManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  FolderOpen, 
  MessageSquare, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  BarChart3
} from "lucide-react";
import { type ClientProject, type ContactSubmission, type InsertClientProject } from "@shared/schema";

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<InsertClientProject>>({
    title: "",
    description: "",
    status: "pending",
    clientId: "",
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && 'role' in user && user.role !== "admin"))) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = isAuthenticated ? "/" : "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery<ClientProject[]>({
    queryKey: ["/api/admin/projects"],
    enabled: isAuthenticated && user && 'role' in user && user.role === "admin",
    retry: false,
  });

  const { data: contacts = [], isLoading: contactsLoading, error: contactsError } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated && user && 'role' in user && user.role === "admin",
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if ((projectsError && isUnauthorizedError(projectsError as Error)) ||
        (contactsError && isUnauthorizedError(contactsError as Error))) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [projectsError, contactsError, toast]);

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertClientProject) => {
      await apiRequest("POST", "/api/admin/projects", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      setIsCreateModalOpen(false);
      setNewProject({ title: "", description: "", status: "pending", clientId: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertClientProject> }) => {
      await apiRequest("PATCH", `/api/admin/projects/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "review":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const handleCreateProject = () => {
    if (!newProject.title || !newProject.clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(newProject as InsertClientProject);
  };

  const handleStatusChange = (projectId: number, newStatus: string) => {
    updateProjectMutation.mutate({
      id: projectId,
      data: { status: newStatus }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !('role' in user) || user.role !== "admin") {
    return null; // Will redirect
  }

  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === "completed").length,
    activeProjects: projects.filter(p => p.status === "in-progress").length,
    pendingContacts: contacts.filter(c => !c.responded).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6">
          <AnimatedSection className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Admin <span className="gradient-text">Portal</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage projects, clients, and monitor business operations.
              </p>
            </div>
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
                  <div className="text-3xl font-bold text-primary mb-2">{stats.totalProjects}</div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">{stats.completedProjects}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">{stats.activeProjects}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">{stats.pendingContacts}</div>
                  <div className="text-sm text-muted-foreground">Pending Contacts</div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" className="space-y-8">
            <TabsList className="glass-effect border-border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="blog" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <FileText className="h-4 w-4 mr-2" />
                Blog Management
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects ({projects.length})
              </TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contacts ({contacts.length})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Recent Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {projects.slice(0, 3).map((project) => (
                          <div key={project.id} className="flex justify-between items-center">
                            <span className="text-sm truncate">{project.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                        ))}
                        {projects.length === 0 && (
                          <p className="text-muted-foreground text-sm">No projects yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Recent Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {contacts.slice(0, 3).map((contact) => (
                          <div key={contact.id} className="flex justify-between items-center">
                            <span className="text-sm truncate">{contact.name}</span>
                            <Badge variant={contact.responded ? "default" : "secondary"} className="text-xs">
                              {contact.responded ? "Responded" : "Pending"}
                            </Badge>
                          </div>
                        ))}
                        {contacts.length === 0 && (
                          <p className="text-muted-foreground text-sm">No contacts yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        onClick={() => setActiveTab("blog")} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Blog Post
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("projects")} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("contacts")} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Contacts
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>
            </TabsContent>

            {/* Blog Management Tab */}
            <TabsContent value="blog">
              <BlogManagement />
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <AnimatedSection>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Project Management</h2>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-black hover:bg-primary/80">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-effect border-border">
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Project Title *</label>
                          <Input
                            value={newProject.title || ""}
                            onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter project title"
                            className="bg-white/10 border-border focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Client ID *</label>
                          <Input
                            value={newProject.clientId || ""}
                            onChange={(e) => setNewProject(prev => ({ ...prev, clientId: e.target.value }))}
                            placeholder="Client user ID"
                            className="bg-white/10 border-border focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Description</label>
                          <Textarea
                            value={newProject.description}
                            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Project description"
                            className="bg-white/10 border-border focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Status</label>
                          <Select value={newProject.status} onValueChange={(value) => setNewProject(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger className="bg-white/10 border-border focus:border-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-effect border-border">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="review">Under Review</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleCreateProject}
                          disabled={createProjectMutation.isPending}
                          className="w-full bg-primary text-black hover:bg-primary/80"
                        >
                          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {projectsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="glass-effect border-border">
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-1/3 mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-4" />
                          <Skeleton className="h-4 w-1/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="glass-effect border-border">
                    <CardContent className="text-center py-12">
                      <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground">Create your first project to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <AnimatedSection key={project.id} delay={index * 0.05}>
                        <Card className="glass-effect border-border hover:border-primary/50 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold">{project.title}</h3>
                                  {getStatusIcon(project.status || "pending")}
                                  <Badge variant="secondary" className={getStatusColor(project.status || "pending")}>
                                    {(project.status || "pending").replace("-", " ").toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground text-sm mb-3">
                                  Client ID: {project.clientId}
                                </p>
                                {project.description && (
                                  <p className="text-muted-foreground mb-3">{project.description}</p>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Created: {formatDate(project.createdAt)} | Updated: {formatDate(project.updatedAt)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Select
                                  value={project.status || "pending"}
                                  onValueChange={(value) => handleStatusChange(project.id, value)}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="glass-effect border-border">
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </AnimatedSection>
                    ))}
                  </div>
                )}
              </AnimatedSection>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">Contact Submissions</h2>
                
                {contactsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="glass-effect border-border">
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-1/3 mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-4" />
                          <Skeleton className="h-4 w-1/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : contacts.length === 0 ? (
                  <Card className="glass-effect border-border">
                    <CardContent className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Contact Submissions</h3>
                      <p className="text-muted-foreground">Contact submissions will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact, index) => (
                      <AnimatedSection key={contact.id} delay={index * 0.05}>
                        <Card className={`glass-effect transition-all duration-300 ${
                          contact.responded ? "border-border" : "border-primary/50"
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                                  {!contact.responded && (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-sm mb-2">
                                  📧 {contact.email}
                                </p>
                                {contact.service && (
                                  <p className="text-muted-foreground text-sm mb-3">
                                    Service: {contact.service}
                                  </p>
                                )}
                                <p className="text-muted-foreground mb-3">{contact.message}</p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(contact.createdAt)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-primary text-primary hover:bg-primary hover:text-black"
                                  onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                                >
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </AnimatedSection>
                    ))}
                  </div>
                )}
              </AnimatedSection>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
