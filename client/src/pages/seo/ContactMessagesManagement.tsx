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
  Mail, 
  Eye, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Calendar,
  User,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  service?: string;
  message: string;
  responded: boolean;
  created_at: string;
}

export default function ContactMessagesManagement() {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContactMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/contact-messages', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setContactMessages(data);
      } else {
        // Mock data for demonstration
        const mockMessages: ContactMessage[] = [
          {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@example.com',
            service: 'Web Development',
            message: 'I need a new website for my business. Can you provide a quote?',
            responded: false,
            created_at: '2025-01-05T09:15:00Z'
          },
          {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            service: 'Mobile App Development',
            message: 'I am interested in developing a mobile app for my startup. What are your rates?',
            responded: true,
            created_at: '2025-01-04T14:30:00Z'
          },
          {
            id: 3,
            name: 'Mike Davis',
            email: 'mike.davis@example.com',
            service: 'E-commerce Development',
            message: 'We need help with our Shopify store optimization and custom features.',
            responded: false,
            created_at: '2025-01-03T16:45:00Z'
          },
          {
            id: 4,
            name: 'Emily Brown',
            email: 'emily.brown@example.com',
            message: 'Do you offer SEO services? I need help with my website ranking.',
            responded: true,
            created_at: '2025-01-02T11:20:00Z'
          }
        ];
        setContactMessages(mockMessages);
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContactMessages();
  }, [fetchContactMessages]);

  const handleMarkAsResponded = async (id: number) => {
    try {
      const response = await fetch(`/api/seo/contact-messages/${id}/respond`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message marked as responded",
        });
        fetchContactMessages();
      } else {
        throw new Error('Failed to mark message as responded');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark message as responded",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      const response = await fetch(`/api/seo/contact-messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        });
        fetchContactMessages();
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const filteredMessages = contactMessages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (message.service && message.service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'responded' && message.responded) ||
                         (statusFilter === 'unresponded' && !message.responded);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Contact Messages</h1>
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
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">Manage incoming contact form submissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{contactMessages.filter(m => !m.responded).length} Unread</span>
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Messages</option>
              <option value="unresponded">Unresponded</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages ({filteredMessages.length})</CardTitle>
          <CardDescription>Manage incoming contact form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'No contact messages yet'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-sm text-muted-foreground">{message.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.service ? (
                        <Badge variant="outline">{message.service}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm">
                        {message.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={message.responded ? 'default' : 'secondary'}
                        className="flex items-center space-x-1 w-fit"
                      >
                        {message.responded ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{message.responded ? 'Responded' : 'Unread'}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsResponded(message.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Responded
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMessage(message.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Delete Message
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
