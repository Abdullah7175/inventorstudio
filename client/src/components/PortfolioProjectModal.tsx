import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

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

interface PortfolioProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<PortfolioProject, 'id'>) => Promise<void>;
  project?: PortfolioProject | null;
  mode: 'create' | 'edit';
}

const categories = [
  { value: 'web', label: 'Web Development' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'video', label: 'Video Production' },
  { value: 'marketing', label: 'Marketing' }
];

export default function PortfolioProjectModal({ 
  isOpen, 
  onClose, 
  onSave, 
  project, 
  mode 
}: PortfolioProjectModalProps) {
  const [formData, setFormData] = useState<Omit<PortfolioProject, 'id'>>({
    title: '',
    description: '',
    image_url: '',
    category: 'web',
    technologies: [],
    project_url: '',
    featured: false
  });
  const [newTechnology, setNewTechnology] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        title: project.title,
        description: project.description,
        image_url: project.image_url,
        category: project.category,
        technologies: project.technologies || [],
        project_url: project.project_url || '',
        featured: project.featured
      });
    } else {
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
  }, [project, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.image_url || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      toast({
        title: "Success",
        description: `Portfolio project ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} portfolio project`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Portfolio Project' : 'Edit Portfolio Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new project to showcase your work and capabilities'
              : 'Update the portfolio project information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project, technologies used, and key features"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Project Image URL *</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/project-image.jpg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_url">Project URL</Label>
            <Input
              id="project_url"
              value={formData.project_url}
              onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
              placeholder="https://example.com/live-project"
            />
          </div>

          <div className="space-y-2">
            <Label>Technologies Used</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter technology (e.g., React, Node.js)"
              />
              <Button type="button" onClick={addTechnology} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(tech)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured">Featured Project</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Update Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
