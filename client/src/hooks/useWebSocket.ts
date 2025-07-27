import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(path: string = '', options: UseWebSocketOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws${path}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        
        // Authenticate with the server
        try {
          ws.send(JSON.stringify({
            type: 'auth',
            userId: (user as any)?.id || 'anonymous',
            role: (user as any)?.role || 'client'
          }));
        } catch (error) {
          console.error('Failed to send auth message:', error);
        }
        
        options.onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          setLastMessage(event.data);
          const message = JSON.parse(event.data);
          options.onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected with code ${event.code}: ${event.reason}`);
        setIsConnected(false);
        
        // Handle different close codes
        if (event.code === 4500) {
          setConnectionError('Internal server error - retrying connection');
        } else if (event.code !== 1000) {
          setConnectionError(`Connection closed unexpectedly (${event.code})`);
        }
        
        options.onDisconnect?.();
        
        // Only attempt to reconnect for certain error codes and if still authenticated
        if (isAuthenticated && event.code !== 1000 && event.code !== 1001) {
          setTimeout(() => {
            if (isAuthenticated) {
              console.log('Attempting to reconnect WebSocket...');
              connect();
            }
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed - check network or server');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect');
    }
  }, [isAuthenticated, user, options]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        setConnectionError('Failed to send message');
      }
    } else {
      console.warn('WebSocket is not connected - message not sent');
      setConnectionError('Not connected - cannot send message');
    }
  }, []);

  const sendChatMessage = useCallback((projectId: number, message: string) => {
    sendMessage({
      type: 'chat_message',
      projectId,
      message,
      senderId: (user as any)?.id || 'anonymous',
      senderRole: (user as any)?.role || 'client'
    });
  }, [sendMessage, user]);

  const sendTypingIndicator = useCallback((projectId: number, isTyping: boolean) => {
    sendMessage({
      type: 'typing',
      projectId,
      senderId: (user as any)?.id || 'anonymous',
      senderRole: (user as any)?.role || 'client',
      isTyping
    });
  }, [sendMessage, user]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return disconnect;
  }, [isAuthenticated, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    lastMessage,
    sendMessage,
    sendChatMessage,
    sendTypingIndicator,
    connect,
    disconnect
  };
}