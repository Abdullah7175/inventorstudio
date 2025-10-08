import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Upload, 
  CheckCircle, 
  Calendar,
  FileText,
  Settings,
  Clock,
  AlertCircle
} from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard";

interface AssignedProject {
  id: number;
  projectName: string;
  status: string;
  priority: string;
  dueDate?: string;
  taskCount: number;
  completedTasks: number;
}

export default function TeamPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Enable 5-minute session timeout
  useSessionTimeout(30);
  
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated or not team member
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== "team")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this area.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: assignedProjects = [], error: projectsError } = useQuery({
    queryKey: ["/api/team/assigned-projects"],
    enabled: isAuthenticated && (user as any)?.role === "team",
    retry: false,
  }) as { data: AssignedProject[], error?: any };

  const { data: teamTasks = [] } = useQuery({
    queryKey: ["/api/team/tasks"],
    enabled: isAuthenticated && (user as any)?.role === "team",
    retry: false,
  }) as { data: any[], error?: any };

  const uploadFileMutation = useMutation({
    mutationFn: async (fileData: FormData) => {
      return apiRequest("/api/team/upload-file", {
        method: "POST",
        body: fileData,
      });
    },
    onSuccess: () => {
      toast({
        title: "File Uploaded",
        description: "File has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team/files"] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Could not upload the file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markProgressMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      return apiRequest(`/api/team/tasks/${taskId}/progress`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Task progress has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team/assigned-projects"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not update task progress. Please try again.",
        variant: "destructive",
      });
    },
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
      case "active": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "on-hold": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "active": return <AlertCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, projectId: number) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("projectId", projectId.toString());
    
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    uploadFileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="mobile-container">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer showDesignRushBadge={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="mobile-container space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold">
              Team Portal
            </h1>
            <p className="text-muted-foreground">
              Manage your assigned tasks, upload files, and track progress.
            </p>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assigned Projects
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedProjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Tasks
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(teamTasks as any[]).filter((t: any) => t.status !== "done").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Tasks
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(teamTasks as any[]).filter((t: any) => t.status === "done").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Portal Tabs */}
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mobile-button">
              <TabsTrigger value="projects" className="text-xs lg:text-sm">
                <Briefcase className="h-4 w-4 mr-1 lg:mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="kanban" className="text-xs lg:text-sm">
                <Settings className="h-4 w-4 mr-1 lg:mr-2" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs lg:text-sm">
                <Upload className="h-4 w-4 mr-1 lg:mr-2" />
                Files
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs lg:text-sm">
                <CheckCircle className="h-4 w-4 mr-1 lg:mr-2" />
                Progress
              </TabsTrigger>
            </TabsList>

            {/* Assigned Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Your Assigned Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedProjects.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No projects assigned yet. Check back later for new assignments.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {assignedProjects.map((project: AssignedProject) => (
                        <div
                          key={project.id}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm lg:text-base mb-1">
                                Project #{project.id}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className={getPriorityColor(project.priority)}>
                                  {project.priority} priority
                                </span>
                                {project.dueDate && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Due: {new Date(project.dueDate).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
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

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Task Progress</span>
                              <span className="text-muted-foreground">
                                {project.completedTasks} / {project.taskCount} completed
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${calculateProgress(project.completedTasks, project.taskCount)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Kanban Interface Tab */}
            <TabsContent value="kanban">
              <Card>
                <CardHeader>
                  <CardTitle>Task Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <KanbanBoard isTeamView={true} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* File Upload Tab */}
            <TabsContent value="files" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Project Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedProjects.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No projects assigned. Files can be uploaded once you're assigned to a project.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {assignedProjects.map((project: AssignedProject) => (
                        <div
                          key={project.id}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">Project #{project.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                Upload files for this project
                              </p>
                            </div>
                            <Badge variant="outline">{project.status}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              multiple
                              onChange={(e) => handleFileUpload(e, project.id)}
                              className="flex-1 mobile-button"
                              accept="*/*"
                            />
                            <Button
                              variant="outline"
                              disabled={uploadFileMutation.isPending}
                              className="mobile-button"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadFileMutation.isPending ? "Uploading..." : "Upload"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tracking Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Task Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No tasks assigned yet. Tasks will appear here once you're assigned to projects.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {teamTasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                Project #{task.projectId}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`${getStatusColor(task.status)} text-white text-xs`}
                              >
                                {task.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newStatus = task.status === "done" ? "review" : "done";
                                  markProgressMutation.mutate({ 
                                    taskId: task.id, 
                                    status: newStatus 
                                  });
                                }}
                                disabled={markProgressMutation.isPending}
                                className="h-6 text-xs mobile-button"
                              >
                                {task.status === "done" ? "Reopen" : "Complete"}
                              </Button>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}
                          
                          {task.dueDate && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
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
      <Footer showDesignRushBadge={false} />
    </div>
  );
}