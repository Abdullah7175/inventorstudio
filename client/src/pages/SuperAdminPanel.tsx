import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Settings, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  BarChart3, 
  Database,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Upload,
  Download
} from "lucide-react";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  technologies: string[];
  featured: boolean;
  createdAt: string;
}

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  technologies: string[];
  projectUrl?: string;
  featured: boolean;
  createdAt: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export default function SuperAdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // Fetch data
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: projects = [] } = useQuery<PortfolioProject[]>({
    queryKey: ["/api/portfolio"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: blogs = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: Partial<Service>) => apiRequest("/api/services", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Service created successfully" });
      setEditingService(null);
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Service> & { id: number }) =>
      apiRequest(`/api/services/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Service updated successfully" });
      setEditingService(null);
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/services/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Service deleted successfully" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: Partial<PortfolioProject>) => apiRequest("/api/portfolio", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Project created successfully" });
      setEditingProject(null);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<PortfolioProject> & { id: number }) =>
      apiRequest(`/api/portfolio/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Project updated successfully" });
      setEditingProject(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/portfolio/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Project deleted successfully" });
    },
  });

  const createBlogMutation = useMutation({
    mutationFn: (data: Partial<BlogPost>) => apiRequest("/api/blog", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post created successfully" });
      setEditingBlog(null);
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<BlogPost> & { id: number }) =>
      apiRequest(`/api/blog/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post updated successfully" });
      setEditingBlog(null);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/blog/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post deleted successfully" });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiRequest(`/api/admin/users/${userId}/role`, "PUT", { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User role updated successfully" });
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You need admin privileges to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleServiceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      icon: formData.get("icon") as string,
      technologies: (formData.get("technologies") as string).split(",").map(t => t.trim()),
      featured: formData.get("featured") === "on",
    };

    if (editingService?.id) {
      updateServiceMutation.mutate({ id: editingService.id, ...data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const handleProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      category: formData.get("category") as string,
      technologies: (formData.get("technologies") as string).split(",").map(t => t.trim()),
      projectUrl: formData.get("projectUrl") as string || undefined,
      featured: formData.get("featured") === "on",
    };

    if (editingProject?.id) {
      updateProjectMutation.mutate({ id: editingProject.id, ...data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const handleBlogSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: (formData.get("title") as string).toLowerCase().replace(/\s+/g, "-"),
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      featuredImage: formData.get("featuredImage") as string || undefined,
      published: formData.get("published") === "on",
      publishedAt: formData.get("published") === "on" ? new Date().toISOString() : undefined,
    };

    if (editingBlog?.id) {
      updateBlogMutation.mutate({ id: editingBlog.id, ...data });
    } else {
      createBlogMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Super Admin Panel</h1>
          <p className="text-muted-foreground">Complete system management and control</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Services</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Projects</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{blogs.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                        <Select
                          value={user.role}
                          onValueChange={(role) => updateUserRoleMutation.mutate({ userId: user.id, role })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Services Management</h2>
              <Button onClick={() => setEditingService({} as Service)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {editingService && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingService.id ? "Edit Service" : "Create Service"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={editingService.title}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="icon">Icon</Label>
                        <Input
                          id="icon"
                          name="icon"
                          defaultValue={editingService.icon}
                          placeholder="e.g., Code, Palette, Megaphone"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingService.description}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                      <Input
                        id="technologies"
                        name="technologies"
                        defaultValue={editingService.technologies?.join(", ")}
                        placeholder="React, TypeScript, Node.js"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        name="featured"
                        defaultChecked={editingService.featured}
                      />
                      <Label htmlFor="featured">Featured Service</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {service.title}
                      {service.featured && <Badge>Featured</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {service.technologies?.map((tech) => (
                        <Badge key={tech} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteServiceMutation.mutate(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Portfolio Management</h2>
              <Button onClick={() => setEditingProject({} as PortfolioProject)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {editingProject && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingProject.id ? "Edit Project" : "Create Project"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={editingProject.title}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue={editingProject.category}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web">Web Development</SelectItem>
                            <SelectItem value="mobile">Mobile App</SelectItem>
                            <SelectItem value="video">Video Production</SelectItem>
                            <SelectItem value="marketing">Digital Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingProject.description}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                          id="imageUrl"
                          name="imageUrl"
                          type="url"
                          defaultValue={editingProject.imageUrl}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectUrl">Project URL (optional)</Label>
                        <Input
                          id="projectUrl"
                          name="projectUrl"
                          type="url"
                          defaultValue={editingProject.projectUrl}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                      <Input
                        id="technologies"
                        name="technologies"
                        defaultValue={editingProject.technologies?.join(", ")}
                        placeholder="React, TypeScript, Node.js"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        name="featured"
                        defaultChecked={editingProject.featured}
                      />
                      <Label htmlFor="featured">Featured Project</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {project.title}
                      {project.featured && <Badge>Featured</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-32 object-cover rounded mb-4"
                    />
                    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                    <Badge className="mb-4">{project.category}</Badge>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies?.map((tech) => (
                        <Badge key={tech} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingProject(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteProjectMutation.mutate(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {project.projectUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blog Management</h2>
              <Button onClick={() => setEditingBlog({} as BlogPost)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Blog Post
              </Button>
            </div>

            {editingBlog && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingBlog.id ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBlogSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingBlog.title}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        name="excerpt"
                        defaultValue={editingBlog.excerpt}
                        placeholder="Brief description of the blog post..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        name="content"
                        defaultValue={editingBlog.content}
                        rows={10}
                        placeholder="Full blog post content..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="featuredImage">Featured Image URL (optional)</Label>
                      <Input
                        id="featuredImage"
                        name="featuredImage"
                        type="url"
                        defaultValue={editingBlog.featuredImage}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        name="published"
                        defaultChecked={editingBlog.published}
                      />
                      <Label htmlFor="published">Publish Immediately</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingBlog(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {blogs.map((blog) => (
                <Card key={blog.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {blog.title}
                      <div className="flex gap-2">
                        {blog.published ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{blog.excerpt}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingBlog(blog)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteBlogMutation.mutate(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-20 flex flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Export Database
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Upload className="h-6 w-6 mb-2" />
                    Import Database
                  </Button>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Database Schema</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{`-- Inventer Design Studio Database Schema
-- Updated: ${new Date().toISOString().split('T')[0]}

-- Users table
users: {
  id: string (primary key),
  email: string (unique),
  firstName: string,
  lastName: string,
  profileImageUrl: string,
  role: string (client|editor|admin),
  createdAt: timestamp,
  updatedAt: timestamp
}

-- Services table
services: {
  id: serial (primary key),
  title: string,
  description: text,
  icon: string,
  technologies: string[],
  featured: boolean,
  createdAt: timestamp
}

-- Portfolio projects table
portfolio_projects: {
  id: serial (primary key),
  title: string,
  description: text,
  imageUrl: string,
  category: string,
  technologies: string[],
  projectUrl: string (optional),
  featured: boolean,
  createdAt: timestamp
}

-- Blog posts table
blog_posts: {
  id: serial (primary key),
  title: string,
  slug: string (unique),
  excerpt: text,
  content: text,
  featuredImage: string (optional),
  authorId: string (references users.id),
  published: boolean,
  publishedAt: timestamp (optional),
  metaTitle: string (optional),
  metaDescription: string (optional),
  tags: string[],
  readingTime: integer,
  createdAt: timestamp,
  updatedAt: timestamp
}

-- Contact submissions table
contact_submissions: {
  id: serial (primary key),
  name: string,
  email: string,
  company: string (optional),
  phone: string (optional),
  message: text,
  services: string[],
  status: string (new|contacted|converted|closed),
  createdAt: timestamp
}

-- Project management tables
client_projects: {
  id: serial (primary key),
  clientId: string (references users.id),
  title: string,
  description: text,
  status: string (pending|active|completed|on_hold),
  startDate: date,
  endDate: date (optional),
  budget: decimal (optional),
  createdAt: timestamp,
  updatedAt: timestamp
}

project_tasks: {
  id: serial (primary key),
  projectId: integer (references client_projects.id),
  title: string,
  description: text,
  status: string (todo|in_progress|review|done),
  priority: string (low|medium|high|urgent),
  assignedTo: string (references users.id, optional),
  dueDate: date (optional),
  createdAt: timestamp,
  updatedAt: timestamp
}

project_files: {
  id: serial (primary key),
  projectId: integer (references client_projects.id),
  fileName: string,
  fileUrl: string,
  fileSize: integer,
  mimeType: string,
  uploadedBy: string (references users.id),
  visibleToClient: boolean,
  createdAt: timestamp
}

project_messages: {
  id: serial (primary key),
  projectId: integer (references client_projects.id),
  senderId: string (references users.id),
  message: text,
  messageType: string (text|file|system),
  isInternal: boolean,
  createdAt: timestamp
}

-- Invoicing system
invoices: {
  id: serial (primary key),
  clientId: string (references users.id),
  projectId: integer (references client_projects.id, optional),
  invoiceNumber: string (unique),
  amount: decimal,
  currency: string,
  status: string (draft|sent|paid|overdue|cancelled),
  dueDate: date,
  paidAt: timestamp (optional),
  createdAt: timestamp,
  updatedAt: timestamp
}

-- FAQ items
faq_items: {
  id: serial (primary key),
  question: string,
  answer: text,
  category: string,
  order: integer,
  published: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}

-- Sessions table (for authentication)
sessions: {
  sid: string (primary key),
  sess: jsonb,
  expire: timestamp
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">System configuration and maintenance tools will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}