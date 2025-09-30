import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FolderOpen, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  MessageSquare,
  User as UserIcon,
  Calendar,
  Plus,
  Settings,
  Bell,
  CreditCard,
  BarChart3,
  Upload,
  Eye,
  Edit,
  Trash2,
  Send,
  Home
} from "lucide-react";
import { type ClientProject, type ProjectRequest, type User } from "@shared/schema";

export default function CustomerConsole() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to login if not authenticated or not a customer
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to access your dashboard.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user && (user as User).role !== 'customer' && (user as User).role !== 'client') {
      toast({
        title: "Access Denied",
        description: "This portal is only for customers. Please use the appropriate portal for your role.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, toast, navigate]);

  // Mock data - replace with actual API calls
  const stats = {
    totalProjects: 0,
    completed: 0,
    inProgress: 0,
    notifications: 0,
  };

  const projects: ClientProject[] = [];
  const projectRequests: ProjectRequest[] = [];

  const StatCard = ({ title, value, icon: Icon, color = "text-primary" }: {
    title: string;
    value: number;
    icon: any;
    color?: string;
  }) => (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, title, description, action }: {
    icon: any;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
  }) => (
    <div className="text-center py-12">
      <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-primary text-black hover:bg-primary/80">
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          color="text-blue-400"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="text-green-400"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="text-yellow-400"
        />
        <StatCard
          title="Notifications"
          value={stats.notifications}
          icon={Bell}
          color="text-purple-400"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No projects yet"
                description="Start by creating your first project request"
                action={{
                  label: "Create Project Request",
                  onClick: () => setActiveTab("requests")
                }}
              />
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-white">{project.title}</p>
                        <p className="text-sm text-gray-400">{project.status}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You'll see updates about your projects here"
            />
          </CardContent>
        </Card>
      </div>

      {/* Project Requests Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Project Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
              <TabsTrigger value="requests" className="text-white">New Request</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              {projectRequests.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No project requests"
                  description="Create your first project request to get started"
                  action={{
                    label: "Create New Request",
                    onClick: () => setActiveTab("requests")
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {projectRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{request.projectName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{request.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Budget: {request.budget}</span>
                        <span>Timeline: {request.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectName" className="text-white">Project Name</Label>
                    <Input
                      id="projectName"
                      placeholder="Enter project name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget" className="text-white">Budget Range</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., $1000 - $5000"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="timeline" className="text-white">Timeline</Label>
                  <Input
                    id="timeline"
                    placeholder="e.g., 2-4 weeks"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project requirements..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="files" className="text-white">Attach Files (Optional)</Label>
                  <div className="mt-2">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Save Draft
                  </Button>
                  <Button className="bg-primary text-black hover:bg-primary/80">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}