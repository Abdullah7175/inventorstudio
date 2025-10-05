import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface ProjectModalProps {
  onProjectUpdate: () => void;
  children: React.ReactNode;
  existingProject?: any;
  mode: 'create' | 'edit';
}

export default function ProjectModal({
  onProjectUpdate,
  children,
  existingProject,
  mode
}: ProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    clientId: existingProject?.customer?.id || '',
    title: existingProject?.projectName || existingProject?.name || '',
    description: existingProject?.description || '',
    budget: existingProject?.budget || '',
    timeline: existingProject?.timeline || '',
    priority: existingProject?.priority || 'medium',
    status: existingProject?.status || 'pending',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && mode === 'create') {
      fetchCustomers();
    }
  }, [open, mode]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/users?role=customer', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const customerUsers = data.filter((user: User) => 
          (user.role === 'customer' || user.role === 'client') && user.isActive
        );
        setCustomers(customerUsers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.title || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = mode === 'create' 
        ? '/api/admin/projects'
        : `/api/admin/projects/${existingProject.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const body = mode === 'create' 
        ? {
            clientId: formData.clientId,
            title: formData.title,
            description: formData.description,
            budget: formData.budget,
            timeline: formData.timeline,
            priority: formData.priority
          }
        : {
            title: formData.title,
            description: formData.description,
            budget: formData.budget,
            timeline: formData.timeline,
            priority: formData.priority,
            status: formData.status
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Project ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onProjectUpdate();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${mode} project`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} project:`, error);
      toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} project`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      budget: '',
      timeline: '',
      priority: 'medium',
      status: 'pending',
    });
  };

  const selectedCustomer = customers.find(c => c.id === formData.clientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? <FolderPlus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            {mode === 'create' ? 'Create Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new project for a customer'
              : 'Update project information'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection (only for create mode) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="clientId">Customer *</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center space-x-2">
                        <span>{customer.firstName} {customer.lastName}</span>
                        <span className="text-muted-foreground">({customer.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomer && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter project title"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          {/* Budget and Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="Enter budget (e.g., $5000)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                placeholder="Enter timeline (e.g., 2 weeks)"
              />
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Processing..." : mode === 'create' ? "Create Project" : "Update Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
