import React, { useState, useEffect } from 'react';
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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
}

interface TeamRole {
  id: number;
  name: string;
  description: string;
  permissions: any;
}

interface TeamMemberModalProps {
  onTeamMemberUpdate: () => void;
  children: React.ReactNode;
  existingTeamMember?: any;
  mode: 'create' | 'edit';
}

export default function TeamMemberModal({
  onTeamMemberUpdate,
  children,
  existingTeamMember,
  mode
}: TeamMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teamRoles, setTeamRoles] = useState<TeamRole[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchTeamRoles();
      
      if (mode === 'edit' && existingTeamMember) {
        setSelectedUserId(existingTeamMember.userId);
        setMemberName(existingTeamMember.name);
        setSkills(existingTeamMember.skills || []);
        // Find role ID by name
        const role = teamRoles.find(r => r.name === existingTeamMember.role);
        if (role) setSelectedRoleId(role.id.toString());
      }
    }
  }, [open, mode, existingTeamMember, teamRoles]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filter to show users who can be assigned team roles (customers and existing team members)
        const availableUsers = data.filter((user: User) => 
          user.isActive && (user.role === 'customer' || user.role === 'team')
        );
        setUsers(availableUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const fetchTeamRoles = async () => {
    try {
      const response = await fetch('/api/admin/team-roles', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTeamRoles(data);
      }
    } catch (error) {
      console.error('Error fetching team roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team roles",
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    if (!selectedUserId || !memberName || !selectedRoleId) {
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
        ? '/api/admin/team-members'
        : `/api/admin/team-members/${selectedUserId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const body = mode === 'create' 
        ? {
            userId: selectedUserId,
            name: memberName,
            roleId: parseInt(selectedRoleId),
            skills
          }
        : {
            name: memberName,
            skills
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
          description: `Team member ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onTeamMemberUpdate();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${mode} team member`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} team member:`, error);
      toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} team member`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUserId('');
    setSelectedRoleId('');
    setMemberName('');
    setSkills([]);
    setNewSkill('');
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? <UserPlus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            {mode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Assign a user to a specific team role (Software Developer, UI/UX Designer, etc.)'
              : 'Update team member information'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Selection (only for create mode) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user to assign team role" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.firstName} {user.lastName}</span>
                        <span className="text-muted-foreground">({user.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.department && (
                    <Badge variant="outline" className="mt-1">
                      {selectedUser.department}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Team Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Team Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select specific role (Software Developer, UI/UX Designer, etc.)" />
              </SelectTrigger>
              <SelectContent>
                {teamRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Member Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Enter display name for team member"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
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
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Processing..." : mode === 'create' ? "Create Team Member" : "Update Team Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
