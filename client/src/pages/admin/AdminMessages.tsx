import React, { useState } from 'react';
import ChatSystem from '@/components/ChatSystem';

export default function AdminMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
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
