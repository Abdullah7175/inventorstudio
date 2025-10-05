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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  skills?: string[];
}

interface ProjectAssignmentModalProps {
  projectId: number;
  projectName: string;
  currentAssignments?: any[];
  onAssignmentUpdate: () => void;
  children: React.ReactNode;
}

export default function ProjectAssignmentModal({
  projectId,
  projectName,
  currentAssignments = [],
  onAssignmentUpdate,
  children
}: ProjectAssignmentModalProps) {
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [assignmentRole, setAssignmentRole] = useState('developer');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
      // Set currently assigned members
      const assignedMemberIds = currentAssignments.map(a => a.teamMemberId);
      setSelectedMembers(assignedMemberIds);
    }
  }, [open, currentAssignments]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/users?role=team', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    }
  };

  const handleAssignProject = async () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one team member",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          teamMemberIds: selectedMembers,
          role: assignmentRole
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project assigned successfully",
        });
        setOpen(false);
        onAssignmentUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign project');
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      toast({
        title: "Error",
        description: "Failed to assign project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (teamMemberId: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/assignments/${teamMemberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment removed successfully",
        });
        onAssignmentUpdate();
      } else {
        throw new Error('Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Team Members to Project
          </DialogTitle>
          <DialogDescription>
            Assign team members to work on "{projectName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignments */}
          {currentAssignments.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Current Assignments</Label>
              <div className="space-y-2">
                {currentAssignments.map((assignment) => {
                  const member = teamMembers.find(m => m.id === assignment.teamMemberId);
                  return member ? (
                    <div key={assignment.teamMemberId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <Badge variant="secondary">{assignment.role}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment.teamMemberId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Assignment Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Assignment Role</Label>
            <Select value={assignmentRole} onValueChange={setAssignmentRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="qa">QA Tester</SelectItem>
                <SelectItem value="lead">Team Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Member Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Team Members</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={member.id}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => toggleMemberSelection(member.id)}
                  />
                  <label htmlFor={member.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                          {member.department && (
                            <Badge variant="outline" className="text-xs">
                              {member.department}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignProject} disabled={loading}>
              {loading ? "Assigning..." : "Assign Team Members"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
