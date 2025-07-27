import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  FileText, 
  MessageSquare, 
  Users, 
  DollarSign,
  CheckCircle,
  X,
  Eye,
  UserPlus,
  Send,
  Calendar,
  Clock
} from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard";
import BlogManager from "@/components/BlogManager";

interface ProjectRequest {
  id: number;
  projectName: string;
  clientId: string;
  serviceIds: string[];
  description: string;
  budget: string;
  timeline: string;
  status: string;
  createdAt: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  skills: string[];
  isActive: boolean;
}

export default function AdminPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this area.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: requests = [], error: requestsError } = useQuery({
    queryKey: ["/api/admin/project-requests"],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["/api/admin/team-members"],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ["/api/admin/all-projects"],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return apiRequest(`/api/admin/project-requests/${requestData.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          adminNotes: requestData.adminNotes,
          assignedTeamId: requestData.assignedTeamId,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "Project request has been approved and team assigned.",
      });
      setSelectedRequest(null);
      setAdminNotes("");
      setAssignedTeam("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/project-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all-projects"] });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Could not approve the request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return apiRequest(`/api/admin/project-requests/${requestData.id}/reject`, {
        method: "POST",
        body: JSON.stringify({
          adminNotes: requestData.adminNotes,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "Project request has been rejected.",
      });
      setSelectedRequest(null);
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/project-requests"] });
    },
    onError: () => {
      toast({
        title: "Rejection Failed",
        description: "Could not reject the request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      return apiRequest("/api/admin/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "Invoice has been generated successfully.",
      });
      setInvoiceAmount("");
      setInvoiceDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
    },
    onError: () => {
      toast({
        title: "Invoice Creation Failed",
        description: "Could not create the invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (requestsError && isUnauthorizedError(requestsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [requestsError, toast]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500";
      case "approved": case "active": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    
    if (!assignedTeam) {
      toast({
        title: "Team Required",
        description: "Please assign a team member to this project.",
        variant: "destructive",
      });
      return;
    }

    approveRequestMutation.mutate({
      id: selectedRequest.id,
      adminNotes,
      assignedTeamId: assignedTeam,
    });
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    
    if (!adminNotes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this request.",
        variant: "destructive",
      });
      return;
    }

    rejectRequestMutation.mutate({
      id: selectedRequest.id,
      adminNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="mobile-container">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="mobile-container space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold">
              Admin Portal
            </h1>
            <p className="text-muted-foreground">
              Manage project requests, assign teams, and oversee all operations.
            </p>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mobile-button">
              <TabsTrigger value="requests" className="text-xs lg:text-sm">
                <FileText className="h-4 w-4 mr-1 lg:mr-2" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs lg:text-sm">
                <MessageSquare className="h-4 w-4 mr-1 lg:mr-2" />
                Client Chat
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs lg:text-sm">
                <Users className="h-4 w-4 mr-1 lg:mr-2" />
                Assign Team
              </TabsTrigger>
              <TabsTrigger value="kanban" className="text-xs lg:text-sm">
                <Settings className="h-4 w-4 mr-1 lg:mr-2" />
                Task Manager
              </TabsTrigger>
              <TabsTrigger value="invoicing" className="text-xs lg:text-sm">
                <DollarSign className="h-4 w-4 mr-1 lg:mr-2" />
                Invoicing
              </TabsTrigger>
              <TabsTrigger value="blog" className="text-xs lg:text-sm">
                <FileText className="h-4 w-4 mr-1 lg:mr-2" />
                Blog
              </TabsTrigger>
            </TabsList>

            {/* Request Review Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {requests.filter((r: ProjectRequest) => r.status === "pending").length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No pending requests.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {requests
                          .filter((r: ProjectRequest) => r.status === "pending")
                          .map((request: ProjectRequest) => (
                          <div
                            key={request.id}
                            className={`p-3 border border-border rounded-lg cursor-pointer transition-all ${
                              selectedRequest?.id === request.id ? "border-primary bg-primary/5" : ""
                            }`}
                            onClick={() => setSelectedRequest(request)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{request.projectName}</h4>
                              <Badge variant="secondary" className="bg-yellow-500 text-white">
                                {request.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <p>Budget: {request.budget}</p>
                              <p>Timeline: {request.timeline}</p>
                              <p>Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Request Details & Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedRequest ? (
                      <p className="text-center text-muted-foreground py-8">
                        Select a request to view details.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">{selectedRequest.projectName}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedRequest.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Budget:</strong> {selectedRequest.budget}
                            </div>
                            <div>
                              <strong>Timeline:</strong> {selectedRequest.timeline}
                            </div>
                            <div>
                              <strong>Services:</strong> {selectedRequest.serviceIds?.length || 0}
                            </div>
                            <div>
                              <strong>Status:</strong> {selectedRequest.status}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Assign Team Member
                          </label>
                          <Select value={assignedTeam} onValueChange={setAssignedTeam}>
                            <SelectTrigger className="mobile-button">
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.map((member: TeamMember) => (
                                <SelectItem key={member.id} value={member.id.toString()}>
                                  {member.name} - {member.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Admin Notes
                          </label>
                          <Textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add internal notes or feedback..."
                            rows={3}
                            className="mobile-button"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleApproveRequest}
                            disabled={approveRequestMutation.isPending}
                            className="flex-1 mobile-button"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleRejectRequest}
                            disabled={rejectRequestMutation.isPending}
                            className="flex-1 mobile-button"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Client Chat Tab */}
            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle>Client Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Client chat interface will be integrated here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Assignment Tab */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamMembers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No team members found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamMembers.map((member: TeamMember) => (
                        <div
                          key={member.id}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                            <Badge 
                              variant={member.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {member.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          {member.skills && member.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {member.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{member.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Kanban Task Manager Tab */}
            <TabsContent value="kanban">
              <Card>
                <CardHeader>
                  <CardTitle>Project Task Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <KanbanBoard />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoicing Tab */}
            <TabsContent value="invoicing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Invoice Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create Invoice */}
                  <div className="space-y-4 p-4 border border-border rounded-lg">
                    <h4 className="font-medium">Create New Invoice</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Amount
                        </label>
                        <Input
                          value={invoiceAmount}
                          onChange={(e) => setInvoiceAmount(e.target.value)}
                          placeholder="$0.00"
                          className="mobile-button"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Project
                        </label>
                        <Select>
                          <SelectTrigger className="mobile-button">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {allProjects.map((project: any) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.projectName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Description
                      </label>
                      <Textarea
                        value={invoiceDescription}
                        onChange={(e) => setInvoiceDescription(e.target.value)}
                        placeholder="Invoice description..."
                        rows={3}
                        className="mobile-button"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        if (!invoiceAmount || !invoiceDescription) {
                          toast({
                            title: "Missing Information",
                            description: "Please fill in all required fields.",
                            variant: "destructive",
                          });
                          return;
                        }
                        createInvoiceMutation.mutate({
                          amount: invoiceAmount,
                          description: invoiceDescription,
                        });
                      }}
                      disabled={createInvoiceMutation.isPending}
                      className="mobile-button"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blog Management Tab */}
            <TabsContent value="blog">
              <BlogManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}