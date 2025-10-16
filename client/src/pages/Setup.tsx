import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, Settings, TrendingUp, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Setup() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRoleUpdate = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/setup/role", {
        method: "POST",
        body: JSON.stringify({ role: selectedRole }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: `Role updated to ${selectedRole}. Please refresh the page to see changes.`,
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const roleOptions = [
    {
      value: "team",
      label: "Team Member",
      description: "Can view assigned tasks, update status, and upload files. Client information is hidden for privacy",
      icon: Users,
      color: "text-blue-500"
    },
    {
      value: "client",
      label: "Client",
      description: "Can view own projects, communicate with team, download files, and view invoices",
      icon: UserCheck,
      color: "text-green-500"
    },
    {
      value: "salesmanager",
      label: "Sales Manager",
      description: "Can manage leads, opportunities, proposals, and sales pipeline. Access to sales analytics and targets",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      value: "businessmanager",
      label: "Business Manager",
      description: "Can manage business development opportunities, partnerships, and strategic initiatives",
      icon: Building2,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Settings className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Account Setup</h1>
            <p className="text-muted-foreground">
              Set your role to access the appropriate features and permissions
            </p>
          </div>

          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Role Configuration
              </CardTitle>
              <CardDescription>
                Current user: {(user as any)?.email || "Unknown"}
                <br />
                Current role: <span className="font-semibold text-primary">{(user as any)?.role || "client"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Select Your Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${role.color}`} />
                            {role.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-lg bg-muted/30 border border-primary/20"
                >
                  {(() => {
                    const role = roleOptions.find(r => r.value === selectedRole);
                    if (!role) return null;
                    const Icon = role.icon;
                    return (
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${role.color}`} />
                        <div>
                          <h3 className="font-semibold mb-1">{role.label}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              <Button
                onClick={handleRoleUpdate}
                disabled={!selectedRole || isUpdating}
                className="w-full bg-primary text-black hover:bg-primary/80"
              >
                {isUpdating ? "Updating..." : "Update Role"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>After updating your role, the page will refresh automatically to apply the changes.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}