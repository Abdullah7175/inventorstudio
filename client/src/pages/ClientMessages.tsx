import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, User, Clock } from "lucide-react";

export default function ClientMessages() {
  const messages = [
    {
      id: 1,
      sender: "Team Lead",
      message: "Hi! We've completed the initial design mockups for your website. Please review and let us know your feedback.",
      timestamp: "2024-01-15 10:30 AM",
      isFromTeam: true
    },
    {
      id: 2,
      sender: "You",
      message: "The designs look great! I love the color scheme. Can we make the header slightly larger?",
      timestamp: "2024-01-15 2:15 PM",
      isFromTeam: false
    },
    {
      id: 3,
      sender: "Designer",
      message: "Absolutely! I'll adjust the header size and send you the updated mockups by tomorrow.",
      timestamp: "2024-01-15 3:45 PM",
      isFromTeam: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-gray-400">Communicate with your project team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Project Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isFromTeam ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.isFromTeam 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-primary text-black'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">{msg.sender}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Send Message */}
        <div>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Send Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    To
                  </label>
                  <Input 
                    placeholder="Select team member"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Type your message..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-primary text-black hover:bg-primary/80">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
