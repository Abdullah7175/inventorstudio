import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import ChatSystem from '@/components/ChatSystem';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { toast } = useToast();

  // Create test customer mutation
  const createTestCustomerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/debug/create-test-customer', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to create test customer');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      // Refresh the page to reload conversations
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Button 
          onClick={() => createTestCustomerMutation.mutate()}
          disabled={createTestCustomerMutation.isPending}
          variant="outline"
        >
          {createTestCustomerMutation.isPending ? 'Creating...' : 'Create Test Customer'}
        </Button>
      </div>
      
      <div className="h-[calc(100vh-200px)]">
        <ChatSystem
          selectedConversationId={selectedConversation}
          onConversationSelect={setSelectedConversation}
          className="h-full"
        />
      </div>
    </div>
  );
}
