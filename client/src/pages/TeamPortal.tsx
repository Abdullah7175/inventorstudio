import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import KanbanBoard from "@/components/KanbanBoard";
import AnimatedSection from "@/components/AnimatedSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Target
} from "lucide-react";
import { type ProjectRequest, type ProjectTask } from "@shared/schema";

export default function TeamPortal() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assigned");

  // Redirect if not authenticated or not team member
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !('role' in user) || !['team', 'admin'].includes(user.role))) {
      toast({
        title: "Unauthorized",
        description: "Team access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = isAuthenticated ? "/" : "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch assigned projects (anonymized for team members)
  const { data: assignedProjects = [] } = useQuery<ProjectRequest[]>({
    queryKey: ["/api/team/assigned-projects"],
    enabled: isAuthenticated && user && 'role' in user && ['team', 'admin'].includes(user.role),
  });

  // Fetch team member's tasks
  const { data: myTasks = [] } = useQuery<ProjectTask[]>({
    queryKey: ["/api/team/my-tasks"],
    enabled: isAuthenticated && user && 'role' in user && ['team', 'admin'].includes(user.role),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "review":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-500/20 text-gray-500";
      case "in-progress":
        return "bg-blue-500/20 text-blue-500";
      case "review":
        return "bg-yellow-500/20 text-yellow-500";
      case "done":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500";
      case "low":
        return "bg-green-500/20 text-green-500";
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
          <p className="text-muted-foreground">Loading team portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !('role' in user) || !['team', 'admin'].includes(user.role)) {
    return null; // Will redirect
  }

  const stats = {
    totalTasks: myTasks.length,
    todoTasks: myTasks.filter(t => t.status === "todo").length,
    inProgressTasks: myTasks.filter(t => t.status === "in-progress").length,
    completedTasks: myTasks.filter(t => t.status === "done").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Team <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome back! Manage your assigned tasks and project contributions.
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
                    {stats.totalTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {stats.inProgressTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-gray-500 mb-2">
                    {stats.todoTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">To Do</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {stats.completedTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
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
              <TabsTrigger value="assigned" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Target className="h-4 w-4 mr-2" />
                Assigned Projects
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <FileText className="h-4 w-4 mr-2" />
                My Tasks
              </TabsTrigger>
            </TabsList>

            {/* Assigned Projects Tab */}
            <TabsContent value="assigned">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">Assigned Projects</h2>
                
                {assignedProjects.length === 0 ? (
                  <Card className="glass-effect border-border">
                    <CardContent className="text-center py-12">
                      <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Assigned Projects</h3>
                      <p className="text-muted-foreground">
                        You'll see projects assigned to you here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {assignedProjects.map((project) => (
                      <Card key={project.id} className="glass-effect border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">
                                Project #{project.id} - {project.projectName}
                              </h3>
                              {project.description && (
                                <p className="text-muted-foreground mb-3">{project.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Timeline: {project.timeline || "Not specified"}</span>
                                <span>Created: {formatDate(project.createdAt)}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
                              {project.status?.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>

                          {/* Project Kanban Board */}
                          <div className="mt-6 pt-6 border-t border-border">
                            <h4 className="text-lg font-semibold mb-4">Project Tasks</h4>
                            <KanbanBoard projectId={project.id} isTeamView={true} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AnimatedSection>
            </TabsContent>

            {/* My Tasks Tab */}
            <TabsContent value="tasks">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">My Tasks</h2>
                
                {myTasks.length === 0 ? (
                  <Card className="glass-effect border-border">
                    <CardContent className="text-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Tasks Assigned</h3>
                      <p className="text-muted-foreground">
                        Tasks assigned to you will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTasks.map((task, index) => (
                      <AnimatedSection key={task.id} delay={index * 0.05}>
                        <Card className="glass-effect border-border hover:border-primary/50 transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="text-lg">{task.title}</span>
                              {getStatusIcon(task.status || "todo")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {task.description && (
                              <p className="text-muted-foreground mb-4">{task.description}</p>
                            )}
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Status:</span>
                                <Badge variant="secondary" className={getStatusColor(task.status || "todo")}>
                                  {(task.status || "todo").replace("-", " ").toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Priority:</span>
                                <Badge variant="outline" className={getPriorityColor(task.priority || "medium")}>
                                  {(task.priority || "medium").toUpperCase()}
                                </Badge>
                              </div>

                              {task.dueDate && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold">Due Date:</span>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(task.dueDate)}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Project:</span>
                                <span className="text-sm text-muted-foreground">#{task.projectId}</span>
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