import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
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
  User,
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
  Send
} from "lucide-react";
import { type ClientProject, type ProjectRequest } from "@shared/schema";

export default function CustomerConsole() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to access your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch client projects
  const { data: projects = [], isLoading: projectsLoading, error } = useQuery<ClientProject[]>({
    queryKey: ["/api/client/projects"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch project requests
  const { data: projectRequests = [], isLoading: requestsLoading } = useQuery<ProjectRequest[]>({
    queryKey: ["/api/client/project-requests"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/client/notifications"],
    enabled: isAuthenticated,
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'review':
        return <Eye className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Manage your projects and track your progress
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === 'in-progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Notifications</p>
                    <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FolderOpen className="h-5 w-5 mr-2" />
                      Recent Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projectsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16" />
                        ))}
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="text-center py-8">
                        <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No projects yet</p>
                        <Button className="mt-4" onClick={() => setActiveTab("requests")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Project Request
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projects.slice(0, 5).map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                              {getStatusIcon(project.status)}
                              <div className="ml-3">
                                <p className="font-medium">{project.title}</p>
                                <p className="text-sm text-gray-500">{project.status}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Recent Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notificationsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-12" />
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.slice(0, 5).map((notification: any) => (
                          <div key={notification.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-500">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                      <p className="text-gray-500 mb-4">Start by creating a project request</p>
                      <Button onClick={() => setActiveTab("requests")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{project.title}</h3>
                              <p className="text-gray-600">{project.description}</p>
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              Created {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Project Request</h3>
                      <p className="text-gray-500 mb-4">Tell us about your project and we'll get back to you</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500">Messages from your project team will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue={user?.firstName} />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue={user?.lastName} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" defaultValue={user?.phone || ''} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue={user?.role} disabled />
                      </div>
                      <div>
                        <Label htmlFor="memberSince">Member Since</Label>
                        <Input id="memberSince" defaultValue={new Date(user?.createdAt || '').toLocaleDateString()} disabled />
                      </div>
                      <div>
                        <Label htmlFor="lastLogin">Last Login</Label>
                        <Input id="lastLogin" defaultValue={user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'} disabled />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </AnimatedSection>
      </div>

      <Footer />
    </div>
  );
}
