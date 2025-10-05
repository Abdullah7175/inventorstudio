import React, { useState, useEffect, useCallback } from 'react';
import ProjectModal from '@/components/ProjectModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  UserPlus
} from 'lucide-react';
import ProjectAssignmentModal from '@/components/ProjectAssignmentModal';

interface Project {
  id: number;
  projectName: string;
  description: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: string;
  timeline: string;
  createdAt: string;
  updatedAt: string;
  assignments?: any[];
}

export default function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/projects?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchTerm]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAssignmentUpdate = () => {
    fetchProjects(); // Refresh projects when assignments are updated
  };

  const getProgressFromStatus = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'reviewing': return 10;
      case 'approved': return 20;
      case 'in_progress': return 50;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Project Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Project Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProjects}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Project Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No projects found</p>
            <p className="text-sm text-muted-foreground mb-6">Projects will appear here when they are created</p>
            <ProjectModal mode="create" onProjectUpdate={fetchProjects}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            </ProjectModal>
          </div>
        </div>
      </div>
    );
  }

  // Mock data - in real app, this would come from API
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Website Redesign',
      description: 'Complete redesign of the main e-commerce platform with modern UI/UX',
      customer: {
        id: '1',
        name: 'TechCorp Inc.',
        email: 'contact@techcorp.com'
      },
      status: 'active',
      priority: 'high',
      progress: 75,
      budget: 25000,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      teamMembers: ['Jane Smith', 'Bob Johnson', 'Alice Brown'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35)
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer engagement and ordering',
      customer: {
        id: '2',
        name: 'StartupXYZ',
        email: 'founder@startupxyz.com'
      },
      status: 'planning',
      priority: 'medium',
      progress: 15,
      budget: 50000,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      teamMembers: ['John Doe', 'Sarah Wilson'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    },
    {
      id: '3',
      name: 'Brand Identity Package',
      description: 'Complete brand identity including logo, colors, and guidelines',
      customer: {
        id: '3',
        name: 'Local Business Co.',
        email: 'owner@localbiz.com'
      },
      status: 'completed',
      priority: 'low',
      progress: 100,
      budget: 5000,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      teamMembers: ['Alice Brown'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50)
    },
    {
      id: '4',
      name: 'Corporate Website',
      description: 'New corporate website with CMS integration',
      customer: {
        id: '4',
        name: 'Marketing Agency',
        email: 'projects@marketingagency.com'
      },
      status: 'on-hold',
      priority: 'medium',
      progress: 45,
      budget: 15000,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
      teamMembers: ['Jane Smith', 'Bob Johnson'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25)
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'on-hold':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleEditProject = (projectId: string) => {
    console.log('Edit project:', projectId);
    // Implement edit functionality
  };

  const handleDeleteProject = (projectId: string) => {
    console.log('Delete project:', projectId);
    // Implement delete functionality
  };

  const handleViewProject = (projectId: string) => {
    console.log('View project:', projectId);
    // Implement view functionality
  };

  const handleUpdateStatus = (projectId: string, newStatus: string) => {
    console.log('Update project status:', projectId, newStatus);
    // Implement status update functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">Manage all projects, track progress, and monitor deadlines</p>
        </div>
        <ProjectModal mode="create" onProjectUpdate={fetchProjects}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </ProjectModal>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total project value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Search and filter projects by status, priority, or name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.projectName}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{project.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(project.status)}
                          <span className="capitalize">{project.status.replace('-', ' ')}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{getProgressFromStatus(project.status)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${getProgressFromStatus(project.status)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{project.budget}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{project.timeline}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ProjectAssignmentModal
                          projectId={project.id}
                          projectName={project.projectName}
                          currentAssignments={project.assignments || []}
                          onAssignmentUpdate={handleAssignmentUpdate}
                        >
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        </ProjectAssignmentModal>
                        <div className="text-sm text-muted-foreground">
                          {(project.assignments || []).length} assigned
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{new Date(project.createdAt).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
