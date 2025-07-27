import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Calendar,
  User,
  Star
} from "lucide-react";

interface ProjectRequest {
  id: number;
  projectName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  serviceIds: string[];
  budget?: string;
  timeline?: string;
  description?: string;
}

interface ProjectTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: string;
}

export default function ProjectTracker() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const { data: projects } = useQuery({
    queryKey: ["/api/client/projects"],
  });

  const { data: projectTasks } = useQuery({
    queryKey: ["/api/client/project-tasks", selectedProject],
    enabled: !!selectedProject,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500";
      case "approved": case "active": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "approved": case "active": return <AlertCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const calculateProgress = (tasks: ProjectTask[] = []) => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === "done").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo": return "bg-gray-500";
      case "in-progress": case "inprogress": return "bg-blue-500";
      case "review": return "bg-yellow-500";
      case "done": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-orange-600";
      case "urgent": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="mobile-container space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!projects || projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No projects found. Start by submitting a service request!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project: ProjectRequest) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 border border-border rounded-lg cursor-pointer transition-all ${
                    selectedProject === project.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm lg:text-base mb-1">
                        {project.projectName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                  </div>

                  {project.budget && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>Budget: {project.budget}</span>
                      {project.timeline && <span>Timeline: {project.timeline}</span>}
                    </div>
                  )}

                  {selectedProject === project.id && projectTasks && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {calculateProgress(projectTasks)}%
                        </span>
                      </div>
                      <Progress value={calculateProgress(projectTasks)} className="mb-4" />
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Current Tasks</h4>
                        {projectTasks.slice(0, 3).map((task: ProjectTask) => (
                          <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                            <div className="flex-1">
                              <p className="text-xs font-medium">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`${getTaskStatusColor(task.status)} text-white text-xs`}
                                >
                                  {task.status}
                                </Badge>
                                <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            {task.dueDate && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                        {projectTasks.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{projectTasks.length - 3} more tasks
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="mobile-button h-auto py-3 flex-col gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">Send Message</span>
              </Button>
              <Button variant="outline" className="mobile-button h-auto py-3 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-xs">View Files</span>
              </Button>
              <Button variant="outline" className="mobile-button h-auto py-3 flex-col gap-2">
                <Star className="h-5 w-5" />
                <span className="text-xs">Leave Feedback</span>
              </Button>
              <Button variant="outline" className="mobile-button h-auto py-3 flex-col gap-2">
                <User className="h-5 w-5" />
                <span className="text-xs">Contact Team</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}