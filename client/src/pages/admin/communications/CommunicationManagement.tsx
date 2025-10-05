import React, { useState } from 'react';
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
  MessageSquare, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail, 
  Eye,
  Plus,
  Bell,
  Send,
  Reply,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Phone,
  Video
} from 'lucide-react';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    type: 'customer' | 'team' | 'admin';
  };
  recipient: {
    id: string;
    name: string;
    email: string;
    type: 'customer' | 'team' | 'admin';
  };
  subject: string;
  content: string;
  type: 'email' | 'chat' | 'support_ticket' | 'notification';
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  attachments?: string[];
  tags?: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target: 'all' | 'customers' | 'team' | 'specific';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledFor?: Date;
  sentAt?: Date;
  recipientCount: number;
  readCount: number;
}

export default function CommunicationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'emails'>('messages');

  // Mock data - in real app, this would come from API
  const messages: Message[] = [
    {
      id: '1',
      sender: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@techcorp.com',
        type: 'customer'
      },
      recipient: {
        id: '2',
        name: 'Alice Johnson',
        email: 'alice.johnson@inventorstudio.com',
        type: 'team'
      },
      subject: 'Project Timeline Question',
      content: 'Hi Alice, I wanted to check on the timeline for our website redesign project. When can we expect the first mockups?',
      type: 'email',
      status: 'read',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      tags: ['project', 'timeline', 'website']
    },
    {
      id: '2',
      sender: {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@localbiz.com',
        type: 'customer'
      },
      recipient: {
        id: '4',
        name: 'Support Team',
        email: 'support@inventorstudio.com',
        type: 'team'
      },
      subject: 'Login Issues',
      content: 'I am having trouble logging into my account. I keep getting an error message.',
      type: 'support_ticket',
      status: 'sent',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      tags: ['login', 'technical', 'urgent']
    },
    {
      id: '3',
      sender: {
        id: '5',
        name: 'Carol Davis',
        email: 'carol.davis@inventorstudio.com',
        type: 'team'
      },
      recipient: {
        id: '6',
        name: 'Jane Smith',
        email: 'jane@startupxyz.com',
        type: 'customer'
      },
      subject: 'Design Review Ready',
      content: 'Hi Jane, the initial designs for your mobile app are ready for review. Please check your portal.',
      type: 'email',
      status: 'delivered',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      tags: ['design', 'review', 'mobile-app']
    }
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM EST.',
      type: 'info',
      target: 'all',
      status: 'sent',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      recipientCount: 1247,
      readCount: 892
    },
    {
      id: '2',
      title: 'New Feature Release',
      message: 'We have released new project collaboration features. Check them out!',
      type: 'success',
      target: 'customers',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24),
      recipientCount: 856,
      readCount: 0
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'Please update your passwords as a precautionary measure.',
      type: 'warning',
      target: 'team',
      status: 'sent',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      recipientCount: 24,
      readCount: 24
    }
  ];

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'support_ticket':
        return <AlertCircle className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'chat':
        return 'bg-green-100 text-green-800';
      case 'support_ticket':
        return 'bg-red-100 text-red-800';
      case 'notification':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'replied':
        return 'bg-purple-100 text-purple-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
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

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const handleReply = (messageId: string) => {
    console.log('Reply to message:', messageId);
    // Implement reply functionality
  };

  const handleArchive = (messageId: string) => {
    console.log('Archive message:', messageId);
    // Implement archive functionality
  };

  const handleDelete = (messageId: string) => {
    console.log('Delete message:', messageId);
    // Implement delete functionality
  };

  const handleViewMessage = (messageId: string) => {
    console.log('View message:', messageId);
    // Implement view functionality
  };

  const handleSendNotification = (notificationId: string) => {
    console.log('Send notification:', notificationId);
    // Implement send functionality
  };

  const handleEditNotification = (notificationId: string) => {
    console.log('Edit notification:', notificationId);
    // Implement edit functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Management</h1>
          <p className="text-muted-foreground">Manage all communications, notifications, and customer interactions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">All communications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter(m => m.status === 'sent' || m.status === 'delivered').length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter(m => m.type === 'support_ticket').length}
            </div>
            <p className="text-xs text-muted-foreground">Open tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'messages' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Messages
        </Button>
        <Button
          variant={activeTab === 'notifications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('notifications')}
        >
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
        <Button
          variant={activeTab === 'emails' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('emails')}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Campaigns
        </Button>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>View and manage all customer communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="support_ticket">Support Ticket</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.subject}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {message.content}
                          </div>
                          {message.tags && message.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(message.type)}>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(message.type)}
                            <span className="capitalize">{message.type.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.sender.name}</div>
                          <div className="text-sm text-muted-foreground">{message.sender.email}</div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {message.sender.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.recipient.name}</div>
                          <div className="text-sm text-muted-foreground">{message.recipient.email}</div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {message.recipient.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatTimestamp(message.timestamp)}</span>
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
                            <DropdownMenuItem onClick={() => handleViewMessage(message.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReply(message.id)}>
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchive(message.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(message.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMessages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No messages found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage system notifications and announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getNotificationTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge className={getNotificationStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                      <Badge variant="outline">
                        {notification.target}
                      </Badge>
                    </div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Recipients: {notification.recipientCount}</span>
                      <span>Read: {notification.readCount}</span>
                      {notification.sentAt && (
                        <span>Sent: {formatTimestamp(notification.sentAt)}</span>
                      )}
                      {notification.scheduledFor && (
                        <span>Scheduled: {notification.scheduledFor.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleSendNotification(notification.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEditNotification(notification.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Campaigns Tab */}
      {activeTab === 'emails' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>Create and manage email marketing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Email Campaigns</h3>
              <p className="text-muted-foreground mb-4">
                Create and manage email marketing campaigns for your customers.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
