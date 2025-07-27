import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, ShoppingCart, Send, X } from "lucide-react";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  basePrice?: string;
}

export default function ServiceCart() {
  const [cartItems, setCartItems] = useState<{ service: Service; quantity: number }[]>([]);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const submitRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return apiRequest("POST", "/api/service-cart/submit", requestData);
    },
    onSuccess: () => {
      toast({
        title: "Project Request Submitted",
        description: "Your project request has been sent for review. We'll contact you soon!",
      });
      setCartItems([]);
      setIsRequestFormOpen(false);
      setProjectName("");
      setNotes("");
      setBudget("");
      setTimeline("");
      queryClient.invalidateQueries({ queryKey: ["/api/client/requests"] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const addToCart = (service: Service) => {
    const existing = cartItems.find(item => item.service.id === service.id);
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.service.id === service.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { service, quantity: 1 }]);
    }
    
    toast({
      title: "Added to Cart",
      description: `${service.title} has been added to your service cart.`,
    });
  };

  const removeFromCart = (serviceId: number) => {
    setCartItems(cartItems.filter(item => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId: number, change: number) => {
    setCartItems(cartItems.map(item => {
      if (item.service.id === serviceId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as { service: Service; quantity: number }[]);
  };

  const handleSubmitRequest = () => {
    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please add services to your cart first.",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      projectName,
      serviceIds: cartItems.map(item => item.service.id.toString()),
      notes,
      budget,
      timeline,
      serviceDetails: cartItems.map(item => ({
        id: item.service.id,
        title: item.service.title,
        quantity: item.quantity
      }))
    };

    submitRequestMutation.mutate(requestData);
  };

  return (
    <div className="mobile-container space-y-6">
      {/* Available Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Available Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services?.map((service: Service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-border rounded-lg bg-card"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm">{service.title}</h3>
                    <Button
                      size="sm"
                      onClick={() => addToCart(service)}
                      className="mobile-button h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Cart */}
      {cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Service Cart ({cartItems.length})
              </span>
              <Button
                onClick={() => setIsRequestFormOpen(true)}
                className="mobile-button"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.service.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.service.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.service.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.service.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.service.id)}
                      className="h-8 w-8 p-0 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Request Form */}
      {isRequestFormOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Project Request Details
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRequestFormOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Project Name *
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter your project name"
                  className="mobile-button"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Budget Range
                </label>
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., $5,000 - $10,000"
                  className="mobile-button"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Timeline
                </label>
                <Input
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g., 2-3 months"
                  className="mobile-button"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Project Details & Requirements
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your project requirements, goals, and any specific details..."
                  rows={4}
                  className="mobile-button"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitRequest}
                  disabled={submitRequestMutation.isPending}
                  className="flex-1 mobile-button"
                >
                  {submitRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRequestFormOpen(false)}
                  className="mobile-button"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}