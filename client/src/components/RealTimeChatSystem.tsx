import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSkeleton from "./LoadingSkeleton";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Phone, 
  Video,
  MoreVertical,
  Users,
  Bell,
  BellOff,
  Minimize,
  Maximize
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "team" | "admin";
  timestamp: Date;
  type: "text" | "file" | "system";
  attachments?: any[];
  edited?: boolean;
}

interface Participant {
  id: string;
  name: string;
  role: "client" | "team" | "admin";
  isOnline: boolean;
  avatar?: string;
}

interface RealTimeChatSystemProps {
  projectId: number;
  participants: Participant[];
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  className?: string;
}

export default function RealTimeChatSystem({
  projectId,
  participants,
  isMinimized = false,
  onToggleMinimize,
  className = ""
}: RealTimeChatSystemProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection for real-time messaging
  const { 
    isConnected, 
    sendMessage: sendWebSocketMessage, 
    lastMessage 
  } = useWebSocket(`/ws/chat/${projectId}`);

  // Load initial messages
  useEffect(() => {
    // Mock initial messages - replace with API call
    const mockMessages: Message[] = [
      {
        id: "1",
        content: "Welcome to the project chat! Feel free to ask any questions.",
        senderId: "admin-1",
        senderName: "Project Manager",
        senderRole: "admin",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        type: "system"
      },
      {
        id: "2",
        content: "Thanks for starting the project! When can we expect the first draft?",
        senderId: "client-1",
        senderName: "John Smith",
        senderRole: "client",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        type: "text"
      },
      {
        id: "3",
        content: "We'll have the initial mockups ready by tomorrow. Working on the design system first.",
        senderId: "team-1",
        senderName: "Sarah Designer",
        senderRole: "team",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        type: "text"
      }
    ];
    setMessages(mockMessages);
  }, [projectId]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        
        if (data.type === "message") {
          const newMessage: Message = {
            id: data.id || Date.now().toString(),
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            senderRole: data.senderRole,
            timestamp: new Date(data.timestamp),
            type: "text"
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // Show notification if enabled and message is from someone else
          if (notifications && data.senderId !== (user as any)?.id) {
            showNotification(data.senderName, data.content);
          }
        } else if (data.type === "typing") {
          setTypingUsers(prev => {
            if (data.isTyping) {
              return prev.includes(data.userId) ? prev : [...prev, data.userId];
            } else {
              return prev.filter(id => id !== data.userId);
            }
          });
          
          // Auto-remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== data.userId));
          }, 3000);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, notifications, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showNotification = (senderName: string, content: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`${senderName}`, {
        body: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
        icon: "/favicon.ico"
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const messageData = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: (user as any).id,
      senderName: (user as any).firstName || "Anonymous",
      senderRole: (user as any).role || "client",
      timestamp: new Date().toISOString(),
      projectId
    };

    // Send via WebSocket
    if (isConnected) {
      sendWebSocketMessage({
        type: "message",
        ...messageData
      });
    }

    // Add to local state immediately for optimistic UI
    const message: Message = {
      ...messageData,
      timestamp: new Date(),
      type: "text"
    };
    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleTyping = () => {
    if (!isTyping && user) {
      setIsTyping(true);
      sendWebSocketMessage({
        type: "typing",
        userId: (user as any).id,
        userName: (user as any).firstName || "Anonymous",
        isTyping: true,
        projectId
      });

      // Stop typing indicator after 2 seconds of inactivity
      setTimeout(() => {
        setIsTyping(false);
        sendWebSocketMessage({
          type: "typing",
          userId: (user as any).id,
          isTyping: false,
          projectId
        });
      }, 2000);
    }
  };

  const getMessageSenderInfo = (message: Message) => {
    const participant = participants.find(p => p.id === message.senderId);
    return {
      name: participant?.name || message.senderName,
      avatar: participant?.avatar,
      isOnline: participant?.isOnline || false
    };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/20 text-red-700 dark:text-red-300";
      case "team": return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "client": return "bg-green-500/20 text-green-700 dark:text-green-300";
      default: return "bg-neutral-500/20 text-neutral-700 dark:text-neutral-300";
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Button
          onClick={onToggleMinimize}
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/80 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        
        {/* Notification badge */}
        {typingUsers.length > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={`fixed bottom-4 right-4 w-96 h-[500px] z-50 ${className}`}
    >
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageSquare className="h-5 w-5" />
                {isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div>
                <CardTitle className="text-sm">Project Chat</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {participants.filter(p => p.isOnline).length} online
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className="h-8 w-8 p-0"
              >
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-8 w-8 p-0"
              >
                <Minimize className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Participants */}
          <div className="flex items-center gap-2 pt-2">
            {participants.slice(0, 4).map((participant) => (
              <div key={participant.id} className="relative">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="text-xs">
                    {participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {participant.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                )}
              </div>
            ))}
            {participants.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{participants.length - 4}
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-3 overflow-y-auto space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const senderInfo = getMessageSenderInfo(message);
              const isOwnMessage = message.senderId === (user as any)?.id;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {message.type === "system" ? (
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {message.content}
                        </Badge>
                      </div>
                    ) : (
                      <div className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="h-6 w-6 mt-1">
                          <AvatarImage src={senderInfo.avatar} />
                          <AvatarFallback className="text-xs">
                            {senderInfo.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`space-y-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{senderInfo.name}</span>
                            <Badge className={`text-xs ${getRoleColor(message.senderRole)}`}>
                              {message.senderRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div
                            className={`p-2 rounded-lg text-sm ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicators */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                <span>
                  {typingUsers.length === 1 ? "Someone is" : `${typingUsers.length} people are`} typing...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1"
              disabled={!isConnected}
            />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="sm"
              className="h-9 w-9 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>
              {isConnected ? "Connected" : "Connecting..."}
            </span>
            <span>
              {messages.length} messages
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}