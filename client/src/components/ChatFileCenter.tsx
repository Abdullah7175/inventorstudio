import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Download, 
  FileText, 
  Image, 
  Archive,
  Calendar,
  User
} from "lucide-react";

interface ProjectMessage {
  id: number;
  message: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
  attachments?: string[];
}

interface ProjectFile {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedBy: string;
  uploadedByRole: string;
  createdAt: string;
}

export default function ChatFileCenter({ projectId }: { projectId: number }) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [realTimeMessages, setRealTimeMessages] = useState<ProjectMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // WebSocket connection for real-time chat
  const { isConnected, sendChatMessage, sendTypingIndicator } = useWebSocket({
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'chat_message' && wsMessage.projectId === projectId) {
        const newMessage: ProjectMessage = {
          id: wsMessage.id,
          message: wsMessage.message,
          senderId: wsMessage.senderId,
          senderRole: wsMessage.senderRole,
          createdAt: wsMessage.timestamp,
          attachments: []
        };
        setRealTimeMessages(prev => [...prev, newMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (wsMessage.type === 'typing') {
        const senderId = wsMessage.senderId;
        setTypingUsers(prev => {
          const newTypingUsers = new Set(prev);
          if (wsMessage.isTyping) {
            newTypingUsers.add(senderId);
          } else {
            newTypingUsers.delete(senderId);
          }
          return newTypingUsers;
        });
      }
    }
  });

  const { data: initialMessages = [] } = useQuery<ProjectMessage[]>({
    queryKey: ["/api/project-messages", projectId],
    enabled: !!projectId,
  });

  const { data: files = [] } = useQuery<ProjectFile[]>({
    queryKey: ["/api/project-files", projectId],
    enabled: !!projectId,
  });

  // Combine initial messages with real-time messages
  const allMessages = [...(Array.isArray(initialMessages) ? initialMessages : []), ...realTimeMessages];

  // Handle typing indicators
  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      sendTypingIndicator(projectId, true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(projectId, false);
    }, 1000);
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // Send via WebSocket for real-time delivery
      if (isConnected) {
        sendChatMessage(projectId, messageData.message);
      }
      
      // Also send to API for persistence
      const formData = new FormData();
      formData.append("projectId", projectId.toString());
      formData.append("message", messageData.message);
      
      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file) => {
          formData.append(`files`, file);
        });
      }

      return apiRequest("/api/project-messages", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      setMessage("");
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      queryClient.invalidateQueries({ queryKey: ["/api/project-messages", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/project-files", projectId] });
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() && !selectedFiles?.length) {
      toast({
        title: "Empty Message",
        description: "Please enter a message or attach files.",
        variant: "destructive",
      });
      return;
    }

    // Stop typing indicator immediately
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(projectId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    sendMessageMutation.mutate({ message });
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (fileType.includes("archive") || fileType.includes("zip")) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mobile-container space-y-6">
      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Project Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {(!allMessages || allMessages.length === 0) ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet. Start a conversation with your team!
              </p>
            ) : (
              allMessages.map((msg: ProjectMessage) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg ${
                    msg.senderRole === "client" 
                      ? "bg-primary/10 ml-8" 
                      : "bg-muted mr-8"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {msg.senderRole === "client" ? "You" : "Team"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {msg.senderRole}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            )}
            
            {/* Typing Indicators */}
            {typingUsers.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-muted mr-8"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Someone is typing...</span>
                </div>
              </motion.div>
            )}
            
            {/* Reference for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedFiles).map((file, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {file.name}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                className="flex-1 mobile-button"
                disabled={!isConnected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="*/*"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mobile-button"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !isConnected}
                className="mobile-button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">
                {isConnected ? 'Real-time chat connected' : 'Connecting to chat...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(files) || files.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No files uploaded yet. Use the chat to share files with your team.
            </p>
          ) : (
            <div className="space-y-3">
              {Array.isArray(files) && files.map((file: ProjectFile) => (
                <motion.div
                  key={file.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>By: {file.uploadedByRole}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mobile-button h-8 w-8 p-0"
                    onClick={() => {
                      // Handle file download
                      window.open(file.filePath, "_blank");
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}