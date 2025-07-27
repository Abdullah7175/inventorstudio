import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  Calendar,
  Star,
  Clock,
  User,
  FileText,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import LoadingSkeleton from "./LoadingSkeleton";

interface CommunicationItem {
  id: string;
  type: 'message' | 'email' | 'call' | 'meeting' | 'note';
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied' | 'scheduled';
  priority: 'high' | 'medium' | 'low';
  projectId?: number;
  projectName?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface CommunicationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'update' | 'reminder' | 'completion' | 'custom';
}

interface PersonalizedCommunicationDashboardProps {
  clientId?: string;
  projectId?: number;
}

export default function PersonalizedCommunicationDashboard({ 
  clientId, 
  projectId 
}: PersonalizedCommunicationDashboardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<'inbox' | 'compose' | 'templates' | 'analytics'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'priority'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    content: '',
    type: 'message' as 'message' | 'email' | 'note',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  const { data: communications, isLoading } = useQuery({
    queryKey: ['/api/communications', clientId, projectId],
    enabled: true
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/communication-templates']
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/communication-analytics', clientId, projectId]
  });

  const sendCommunication = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/communications', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      setComposeForm({
        to: '',
        subject: '',
        content: '',
        type: 'message',
        priority: 'medium'
      });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (communicationId: string) => {
      return await apiRequest(`/api/communications/${communicationId}/read`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'neutral': return 'text-gray-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const applyTemplate = (template: CommunicationTemplate) => {
    setComposeForm({
      ...composeForm,
      subject: template.subject,
      content: template.content
    });
    setSelectedTemplate(template);
  };

  const handleSend = () => {
    if (!composeForm.to || !composeForm.content) return;

    sendCommunication.mutate({
      ...composeForm,
      clientId: clientId || composeForm.to,
      projectId,
      userId: user?.id
    });
  };

  const filteredCommunications = communications?.filter((comm: CommunicationItem) => {
    const matchesSearch = searchTerm === '' || 
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' ||
      (filterType === 'unread' && comm.status === 'unread') ||
      (filterType === 'priority' && comm.priority === 'high');

    return matchesSearch && matchesFilter;
  }) || [];

  if (isLoading) {
    return (
      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle>Communication Center</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton count={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-lime-400" />
            Communication Center
          </CardTitle>
          
          <div className="flex gap-2">
            {['inbox', 'compose', 'templates', 'analytics'].map((tab) => (
              <Button
                key={tab}
                variant={selectedTab === tab ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab(tab as any)}
                className={selectedTab === tab ? 'bg-lime-400 text-black' : ''}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {selectedTab === 'inbox' && (
          <div className="h-full flex flex-col">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterType(filterType === 'all' ? 'unread' : filterType === 'unread' ? 'priority' : 'all')}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filterType === 'all' ? 'All' : filterType === 'unread' ? 'Unread' : 'Priority'}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredCommunications.map((comm: CommunicationItem) => (
                <div
                  key={comm.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${comm.status === 'unread' ? 'border-lime-400 bg-lime-50 dark:bg-lime-900/20' : 'bg-white dark:bg-gray-800'}
                  `}
                  onClick={() => markAsRead.mutate(comm.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comm.clientAvatar} />
                        <AvatarFallback>
                          {comm.clientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(comm.type)}
                          <span className="font-medium">{comm.clientName}</span>
                          {comm.status === 'unread' && (
                            <Badge variant="secondary" className="bg-lime-400 text-black text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        {comm.projectName && (
                          <span className="text-xs text-gray-500">
                            Project: {comm.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary"
                        className={`${getPriorityColor(comm.priority)} text-white text-xs`}
                      >
                        {comm.priority.toUpperCase()}
                      </Badge>
                      {comm.sentiment && (
                        <Star className={`w-4 h-4 ${getSentimentColor(comm.sentiment)}`} />
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comm.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-1">{comm.subject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {comm.content}
                  </p>
                </div>
              ))}
              
              {filteredCommunications.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No communications found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'compose' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="To (Client name or email)"
                value={composeForm.to}
                onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
              />
              <select
                value={composeForm.type}
                onChange={(e) => setComposeForm({ ...composeForm, type: e.target.value as any })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="message">Message</option>
                <option value="email">Email</option>
                <option value="note">Internal Note</option>
              </select>
            </div>
            
            <Input
              placeholder="Subject"
              value={composeForm.subject}
              onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
            />
            
            <Textarea
              placeholder="Your message..."
              value={composeForm.content}
              onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
              rows={8}
            />
            
            <div className="flex justify-between items-center">
              <select
                value={composeForm.priority}
                onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value as any })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <Button
                onClick={handleSend}
                disabled={!composeForm.to || !composeForm.content}
                className="bg-lime-400 text-black hover:bg-lime-500"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        )}

        {selectedTab === 'templates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates?.map((template: CommunicationTemplate) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-lime-400"
                  onClick={() => applyTemplate(template)}
                >
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {template.subject}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-3">
                      {template.content}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {template.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-lime-400">
                    {analytics?.totalCommunications || 0}
                  </div>
                  <p className="text-sm text-gray-500">Total Communications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {analytics?.responseTime || '2.5h'}
                  </div>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-400">
                    {analytics?.satisfactionScore || '94%'}
                  </div>
                  <p className="text-sm text-gray-500">Client Satisfaction</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    {analytics?.unreadCount || 0}
                  </div>
                  <p className="text-sm text-gray-500">Unread Messages</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Communication Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center text-gray-500">
                  Communication trends chart would go here
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}