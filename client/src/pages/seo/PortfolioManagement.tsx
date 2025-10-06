import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  FileText,
  Eye,
  Star,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PortfolioProjectModal from '@/components/PortfolioProjectModal';

interface PortfolioProject {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  technologies: string[];
  project_url?: string;
  featured: boolean;
  created_at?: string;
}

interface PortfolioModalProps {
  mode: 'create' | 'edit';
  existingProject?: PortfolioProject;
  onProjectUpdate: () => void;
  children: React.ReactNode;
}

// Portfolio Modal Component
function PortfolioModal({ mode, existingProject, onProjectUpdate, children }: PortfolioModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'web',
    technologies: [] as string[],
    project_url: '',
    featured: false
  });
  const [newTech, setNewTech] = useState('');
  const { toast } = useToast();

  const categories = [
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'video', label: 'Video Production' },
    { value: 'marketing', label: 'Marketing' }
  ];

  useEffect(() => {
    if (open && mode === 'edit' && existingProject) {
      setFormData({
        title: existingProject.title,
        description: existingProject.description,
        image_url: existingProject.image_url,
        category: existingProject.category,
        technologies: existingProject.technologies,
        project_url: existingProject.project_url || '',
        featured: existingProject.featured
      });
    } else if (open && mode === 'create') {
      setFormData({
        title: '',
        description: '',
        image_url: '',
        category: 'web',
        technologies: [],
        project_url: '',
        featured: false
      });
    }
  }, [open, mode, existingProject]);

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = mode === 'create' ? '/api/seo/portfolio' : `/api/seo/portfolio/${existingProject?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Project ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onProjectUpdate();
      } else {
        throw new Error('Failed to save project');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            <CardHeader>
              <CardTitle>{mode === 'create' ? 'Add New Project' : 'Edit Project'}</CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Add a new project to your portfolio' : 'Update project information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Project title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description"
                    className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Project URL</label>
                  <Input
                    value={formData.project_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
                    placeholder="https://example.com (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Technologies</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technology..."
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    />
                    <Button type="button" onClick={addTechnology} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured Project
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'create' ? 'Create Project' : 'Update Project'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default function PortfolioManagement() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/portfolio', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        // Mock data for demonstration
        const mockProjects: PortfolioProject[] = [
          {
            id: 1,
            title: 'E-commerce Platform',
            description: 'Modern e-commerce platform built with React and Node.js',
            image_url: 'https://example.com/ecommerce.jpg',
            category: 'web',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            project_url: 'https://example.com',
            featured: true,
            created_at: '2025-01-01T10:00:00Z'
          },
          {
            id: 2,
            title: 'Mobile Banking App',
            description: 'Secure mobile banking application with biometric authentication',
            image_url: 'https://example.com/banking.jpg',
            category: 'mobile',
            technologies: ['React Native', 'Node.js', 'PostgreSQL'],
            featured: true,
            created_at: '2025-01-01T10:00:00Z'
          },
          {
            id: 3,
            title: 'Corporate Website',
            description: 'Professional corporate website with CMS integration',
            image_url: 'https://example.com/corporate.jpg',
            category: 'web',
            technologies: ['Next.js', 'TypeScript', 'Contentful'],
            project_url: 'https://example.com',
            featured: false,
            created_at: '2025-01-01T10:00:00Z'
          }
        ];
        setProjects(mockProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCreateProject = async (projectData: Omit<PortfolioProject, 'id'>) => {
    try {
      const response = await fetch('/api/seo/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        fetchProjects();
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateProject = async (projectData: Omit<PortfolioProject, 'id'>) => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch(`/api/seo/portfolio/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        fetchProjects();
      } else {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      const response = await fetch(`/api/seo/portfolio/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        fetchProjects();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProject(null);
    setModalOpen(true);
  };

  const openEditModal = (project: PortfolioProject) => {
    setModalMode('edit');
    setSelectedProject(project);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/seo/portfolio/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        fetchProjects();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'video', label: 'Video Production' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">Manage your portfolio projects and showcase your work</p>
        </div>
        <PortfolioModal mode="create" onProjectUpdate={fetchProjects}>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
        </PortfolioModal>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>Manage all your portfolio projects</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your search criteria' : 'Get started by adding your first project'}
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <PortfolioModal mode="create" onProjectUpdate={fetchProjects}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Project
                  </Button>
                </PortfolioModal>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Technologies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {project.image_url ? (
                            <img 
                              src={project.image_url} 
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {project.description}
                          </div>
                          {project.project_url && (
                            <a 
                              href={project.project_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center space-x-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>View Project</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {project.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 2).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {project.featured && (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Featured</span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PortfolioModal mode="edit" existingProject={project} onProjectUpdate={fetchProjects}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                          </PortfolioModal>
                          <DropdownMenuItem
                            onClick={() => project.id && handleDelete(project.id)}
                            className="text-destructive"
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Portfolio Project Modal */}
      <PortfolioProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={modalMode === 'create' ? handleCreateProject : handleUpdateProject}
        project={selectedProject}
        mode={modalMode}
      />
    </div>
  );
}
