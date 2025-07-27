import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Circle
} from "lucide-react";

interface ProjectTask {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
  position: number;
  projectId: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To Do", status: "todo", color: "bg-gray-500" },
  { id: "inprogress", title: "In Progress", status: "in-progress", color: "bg-blue-500" },
  { id: "review", title: "Review", status: "review", color: "bg-yellow-500" },
  { id: "done", title: "Done", status: "done", color: "bg-green-500" },
];

export default function KanbanBoard({ 
  projectId, 
  isTeamView = false 
}: { 
  projectId?: number; 
  isTeamView?: boolean; 
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: isTeamView 
      ? ["/api/team/tasks"] 
      : ["/api/project-tasks", projectId],
    enabled: isTeamView || !!projectId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("/api/project-tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Task Created",
        description: "New task has been added to the project.",
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setShowNewTaskForm(false);
      setSelectedColumn(null);
      queryClient.invalidateQueries({ 
        queryKey: isTeamView ? ["/api/team/tasks"] : ["/api/project-tasks", projectId] 
      });
    },
    onError: () => {
      toast({
        title: "Failed to Create Task",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      return apiRequest(`/api/project-tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: isTeamView ? ["/api/team/tasks"] : ["/api/project-tasks", projectId] 
      });
    },
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium": return <Circle className="h-4 w-4 text-yellow-500" />;
      case "low": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks?.filter((task: ProjectTask) => task.status === status) || [];
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }

    const taskData = {
      title: newTaskTitle,
      description: newTaskDescription,
      status: selectedColumn || "todo",
      priority: "medium",
      projectId: projectId || 0,
    };

    createTaskMutation.mutate(taskData);
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    if (taskId) {
      updateTaskStatusMutation.mutate({ taskId, status });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mobile-container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {columns.map((column) => (
          <Card key={column.id} className="min-h-96">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <span className="text-sm lg:text-base">{column.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {getTasksByStatus(column.status).length}
                  </Badge>
                </div>
                {!isTeamView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedColumn(column.status);
                      setShowNewTaskForm(true);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent
              className="space-y-3"
              onDrop={(e) => handleDrop(e, column.status)}
              onDragOver={handleDragOver}
            >
              <AnimatePresence>
                {getTasksByStatus(column.status).map((task: ProjectTask) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-3 bg-card border border-border rounded-lg cursor-move hover:shadow-md transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(task.priority)}
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {task.assignedTo && !isTeamView && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Assigned</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {isTeamView && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Project #{task.projectId}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTaskStatusMutation.mutate({ 
                              taskId: task.id, 
                              status: task.status === "done" ? "review" : "done" 
                            })}
                            className="h-6 text-xs"
                          >
                            {task.status === "done" ? "Reopen" : "Complete"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* New Task Form */}
              {showNewTaskForm && selectedColumn === column.status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 border-2 border-dashed border-primary/50 rounded-lg space-y-3"
                >
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="text-sm"
                  />
                  <Textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Task description (optional)..."
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateTask}
                      disabled={createTaskMutation.isPending}
                      className="text-xs"
                    >
                      Add Task
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowNewTaskForm(false);
                        setSelectedColumn(null);
                        setNewTaskTitle("");
                        setNewTaskDescription("");
                      }}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}