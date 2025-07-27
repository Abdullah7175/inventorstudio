import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  MoreVertical,
  Trash2,
  Edit,
  FileUpload
} from "lucide-react";
import { type ProjectTask, type InsertProjectTask, type TeamMember } from "@shared/schema";

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  tasks: ProjectTask[];
}

interface KanbanBoardProps {
  projectId: number;
  isTeamView?: boolean;
}

export default function KanbanBoard({ projectId, isTeamView = false }: KanbanBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedTask, setDraggedTask] = useState<ProjectTask | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<InsertProjectTask>>({
    projectId,
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
  });

  // Fetch tasks for this project
  const { data: tasks = [], isLoading } = useQuery<ProjectTask[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
    enabled: !!projectId,
  });

  // Fetch team members for assignment
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/members"],
    enabled: !isTeamView, // Only admins can see team members
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertProjectTask) => {
      return await apiRequest("/api/tasks", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      setIsCreateTaskOpen(false);
      setNewTask({
        projectId,
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignedTo: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status, position }: { taskId: number; status: string; position?: number }) => {
      return await apiRequest(`/api/tasks/${taskId}`, "PATCH", { status, position });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest(`/api/tasks/${taskId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const columns: KanbanColumn[] = [
    {
      id: "todo",
      title: "To Do",
      status: "todo",
      color: "bg-gray-500/20 text-gray-500",
      tasks: tasks.filter(task => task.status === "todo"),
    },
    {
      id: "in-progress",
      title: "In Progress",
      status: "in-progress",
      color: "bg-blue-500/20 text-blue-500",
      tasks: tasks.filter(task => task.status === "in-progress"),
    },
    {
      id: "review",
      title: "Review",
      status: "review",
      color: "bg-yellow-500/20 text-yellow-500",
      tasks: tasks.filter(task => task.status === "review"),
    },
    {
      id: "done",
      title: "Done",
      status: "done",
      color: "bg-green-500/20 text-green-500",
      tasks: tasks.filter(task => task.status === "done"),
    },
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const handleDragStart = (task: ProjectTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      updateTaskMutation.mutate({
        taskId: draggedTask.id,
        status: newStatus,
      });
    }
    setDraggedTask(null);
  };

  const handleCreateTask = () => {
    if (!newTask.title?.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate(newTask as InsertProjectTask);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-effect border-border">
            <CardHeader>
              <div className="h-6 bg-white/10 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-20 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Board</h2>
        {!isTeamView && (
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-black hover:bg-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-border">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Task Title *</label>
                  <Input
                    value={newTask.title || ""}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                    className="bg-white/10 border-border focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <Textarea
                    value={newTask.description || ""}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description..."
                    className="bg-white/10 border-border focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="bg-white/10 border-border focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-border">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Assign To</label>
                    <Select
                      value={newTask.assignedTo}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
                    >
                      <SelectTrigger className="bg-white/10 border-border focus:border-primary">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-border">
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.userId}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  className="w-full bg-primary text-black hover:bg-primary/80"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <Card className="glass-effect border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color.split(' ')[0]}`} />
                    {column.title}
                  </div>
                  <Badge variant="secondary" className={column.color}>
                    {column.tasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Tasks */}
            <div className="space-y-3">
              {column.tasks.map((task) => {
                const assignedMember = teamMembers.find(m => m.userId === task.assignedTo);
                return (
                  <Card
                    key={task.id}
                    className={`glass-effect border-border hover:border-primary/50 transition-all duration-300 cursor-move border-l-4 ${getPriorityColor(task.priority || "medium")}`}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm leading-tight">{task.title}</h4>
                        {!isTeamView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(task.priority || "medium")}
                          {assignedMember && (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {assignedMember.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {!isTeamView && (
                                <span className="text-xs text-muted-foreground">
                                  {assignedMember.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {column.tasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}