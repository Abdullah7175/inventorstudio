import React, { useState } from 'react';
import ChatSystem from '@/components/ChatSystem';

export default function ClientMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-gray-400">Communicate with your project team</p>
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