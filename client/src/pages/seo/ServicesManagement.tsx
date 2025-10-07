import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  Briefcase,
  Eye,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  technologies: string[];
  featured: boolean;
  created_at: string;
}

interface ServiceModalProps {
  mode: 'create' | 'edit';
  existingService?: Service;
  onServiceUpdate: () => void;
  children: React.ReactNode;
}

// Service Modal Component
function ServiceModal({ mode, existingService, onServiceUpdate, children }: ServiceModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    technologies: [] as string[],
    featured: false
  });
  const [newTech, setNewTech] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && mode === 'edit' && existingService) {
      setFormData({
        title: existingService.title,
        description: existingService.description,
        icon: existingService.icon,
        technologies: existingService.technologies,
        featured: existingService.featured
      });
    } else if (open && mode === 'create') {
      setFormData({
        title: '',
        description: '',
        icon: '',
        technologies: [],
        featured: false
      });
    }
  }, [open, mode, existingService]);

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
      const url = mode === 'create' ? '/api/seo/services' : `/api/seo/services/${existingService?.id}`;
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
          description: `Service ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onServiceUpdate();
      } else {
        throw new Error('Failed to save service');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {open && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <Card 
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto mx-4 my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>{mode === 'create' ? 'Add New Service' : 'Edit Service'}</CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Create a new service for your website' : 'Update service information'}
              </CardDescription>
            </CardHeader>
            <CardContent onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Service title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Service description"
                    className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="Icon name (e.g., Code, Smartphone)"
                    required
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
                    Featured Service
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'create' ? 'Create Service' : 'Update Service'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/services', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        console.error('Failed to fetch services:', response.status, response.statusText);
        setServices([]);
        toast({
          title: "Error",
          description: "Failed to fetch services. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/seo/services/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
        fetchServices();
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Services Management</h1>
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
          <h1 className="text-3xl font-bold">Services Management</h1>
          <p className="text-muted-foreground">Manage your website services and offerings</p>
        </div>
        <ServiceModal mode="create" onServiceUpdate={fetchServices}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </ServiceModal>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({filteredServices.length})</CardTitle>
          <CardDescription>Manage all your website services</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first service'}
              </p>
              {!searchTerm && (
                <ServiceModal mode="create" onServiceUpdate={fetchServices}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Service
                  </Button>
                </ServiceModal>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Technologies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{service.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {service.technologies.slice(0, 2).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {service.technologies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.technologies.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {service.featured && (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Featured</span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(service.created_at).toLocaleDateString()}
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
                          <ServiceModal mode="edit" existingService={service} onServiceUpdate={fetchServices}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Service
                            </DropdownMenuItem>
                          </ServiceModal>
                          <DropdownMenuItem
                            onClick={() => handleDelete(service.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Service
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
    </div>
  );
}
