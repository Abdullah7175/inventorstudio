import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, Wifi, WifiOff } from "lucide-react";

interface TestMessage {
  id: number;
  message: string;
  senderId: string;
  senderRole: string;
  timestamp: string;
}

export default function RealTimeChatTest() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const { isConnected, sendChatMessage, sendTypingIndicator } = useWebSocket({
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'chat_message') {
        const newMessage: TestMessage = {
          id: wsMessage.id,
          message: wsMessage.message,
          senderId: wsMessage.senderId,
          senderRole: wsMessage.senderRole,
          timestamp: wsMessage.timestamp
        };
        setMessages(prev => [...prev, newMessage]);
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

  const handleSendMessage = () => {
    if (!message.trim() || !isConnected) return;
    
    // Send test message to project ID 999 (test project)
    sendChatMessage(999, message);
    setMessage("");
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (value.length > 0) {
      sendTypingIndicator(999, true);
    }
    
    // Stop typing after 1 second of no input
    setTimeout(() => {
      sendTypingIndicator(999, false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Real-Time Chat Test
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages Area */}
            <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Send a message to test real-time chat!
                </p>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2 rounded ${
                      msg.senderId === (user as any)?.id
                        ? "bg-primary/10 ml-8"
                        : "bg-muted mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">
                        {msg.senderId === (user as any)?.id ? "You" : msg.senderId}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </motion.div>
                ))
              )}
              
              {/* Typing Indicators */}
              {typingUsers.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 rounded bg-muted mr-8"
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
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder={isConnected ? "Type a test message..." : "Connecting..."}
                disabled={!isConnected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Connection Status */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'WebSocket Connected' : 'Connecting...'}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-2">Test Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Open this page in multiple browser tabs to test real-time messaging</li>
                <li>Messages appear instantly without page refresh</li>
                <li>Typing indicators show when someone is typing</li>
                <li>Connection status shows WebSocket health</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}