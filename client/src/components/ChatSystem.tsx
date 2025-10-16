import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Paperclip,
  Smile,
  MoreVertical,
  Users,
  Search,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: number;
  projectId?: number;
  senderId: string;
  message: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  attachments?: any;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImageUrl?: string;
  };
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  projectId?: number;
  projectName?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isOnline?: boolean;
}

interface ChatSystemProps {
  projectId?: number;
  selectedConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
  className?: string;
}

export default function ChatSystem({ 
  projectId, 
  selectedConversationId, 
  onConversationSelect,
  className = '' 
}: ChatSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/chat/conversations', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/conversations?projectId=${projectId || ''}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      console.log('ChatSystem: Fetched conversations:', data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages', selectedConversationId, projectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId.toString());
      if (selectedConversationId) params.append('conversationId', selectedConversationId);
      
      console.log('ChatSystem: Fetching messages for conversation:', selectedConversationId, 'with params:', params.toString());
      const response = await fetch(`/api/chat/messages?${params}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      console.log('ChatSystem: Fetched messages:', data);
      return data;
    },
    enabled: !!selectedConversationId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; messageType?: string; attachments?: any }) => {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          projectId,
          conversationId: selectedConversationId
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/unread-count'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/chat/messages/${messageId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      return response.json();
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId && messages.length > 0) {
      const unreadMessages = messages.filter(msg => !msg.isRead && msg.senderId !== user?.id);
      unreadMessages.forEach(msg => {
        markAsReadMutation.mutate(msg.id);
      });
    }
  }, [selectedConversationId, messages, user?.id]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    sendMessageMutation.mutate({
      message: newMessage.trim(),
      messageType: 'text'
    });
  }, [newMessage, selectedConversationId, sendMessageMutation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!selectedConversationId) return;
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch(`/api/chat/upload/${selectedConversationId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        // Send a message with file attachments
        sendMessageMutation.mutate({
          message: `Sent ${files.length} file(s)`,
          messageType: 'file',
          attachments: result.files
        });
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload files",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: "An error occurred while uploading files",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Ensure we don't get negative values
    const absDiff = Math.abs(diff);
    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    // If the timestamp is in the future (negative diff), show "just now"
    if (diff < 0) return "just now";
    
    // For very recent messages (less than 1 minute), show "just now"
    if (minutes < 1) return "just now";
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  if (conversationsLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-background ${className}`}>
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </h2>
            <Badge variant="secondary" className="text-xs">
              {conversations.length}
            </Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConversationId === conversation.id ? 'bg-primary/10 border-primary/20' : ''
                  }`}
                  onClick={() => {
                    console.log('ChatSystem: Selecting conversation:', conversation.id);
                    onConversationSelect?.(conversation.id);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.participantId} />
                          <AvatarFallback>
                            {conversation.participantName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {conversation.participantName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="truncate">
                            {conversation.projectName && (
                              <span className="font-medium">{conversation.projectName} • </span>
                            )}
                            {conversation.lastMessage?.message || 'No messages yet'}
                          </span>
                          {conversation.lastMessage && (
                            <span>{formatTime(conversation.lastMessage.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.participantId} />
                    <AvatarFallback>
                      {selectedConversation.participantName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.projectName && (
                        <span>{selectedConversation.projectName} • </span>
                      )}
                      {selectedConversation.participantRole}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.senderId !== user?.id && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={message.sender?.profileImageUrl} />
                          <AvatarFallback>
                            {message.sender?.firstName?.charAt(0) || message.sender?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${message.senderId === user?.id ? 'order-first' : ''}`}>
                        {message.senderId !== user?.id && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {message.sender?.firstName || message.sender?.email}
                          </p>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                      
                      {message.senderId === user?.id && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={user.profileImageUrl} />
                          <AvatarFallback>
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = 'image/*,application/pdf,.doc,.docx,.txt';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length > 0) {
                        handleFileUpload(files);
                      }
                    };
                    input.click();
                  }}
                  title="Attach files"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
