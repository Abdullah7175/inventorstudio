import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, X, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserModalProps {
  onUserUpdate: () => void;
  children: React.ReactNode;
  existingUser?: any;
  mode: 'create' | 'edit';
}

export default function UserModal({
  onUserUpdate,
  children,
  existingUser,
  mode
}: UserModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: existingUser?.email || '',
    firstName: existingUser?.firstName || '',
    lastName: existingUser?.lastName || '',
    phone: existingUser?.phone || '',
    role: existingUser?.role || 'customer',
    department: existingUser?.department || '',
    password: '',
    skills: existingUser?.skills || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'create' && !formData.password) {
      toast({
        title: "Missing Password",
        description: "Password is required for new users",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = mode === 'create' 
        ? '/api/admin/users'
        : `/api/admin/users/${existingUser.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const body = mode === 'create' 
        ? {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            role: formData.role,
            department: formData.department,
            skills: formData.skills,
            password: formData.password
          }
        : {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            role: formData.role,
            department: formData.department,
            skills: formData.skills,
            ...(formData.password && { password: formData.password })
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
          description: `User ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onUserUpdate();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${mode} user`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} user`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'customer',
      department: '',
      password: '',
      skills: [],
    });
    setNewSkill('');
  };

  const handleDeactivate = async () => {
    if (!existingUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${existingUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deactivated successfully",
        });
        setOpen(false);
        onUserUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? <UserPlus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            {mode === 'create' ? 'Create User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new user account'
              : 'Update user information'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Enter department"
            />
          </div>

          {/* Password (only for create or if editing) */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={mode === 'create' ? "Enter password" : "Enter new password"}
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <Button type="button" onClick={handleAddSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {mode === 'edit' && existingUser && (
                <Button 
                  variant="destructive" 
                  onClick={handleDeactivate}
                  disabled={loading}
                >
                  Deactivate User
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Processing..." : mode === 'create' ? "Create User" : "Update User"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
