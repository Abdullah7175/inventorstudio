import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Minus, Send, FileUpload, Trash2 } from "lucide-react";
import { type Service, type InsertServiceCart, type ServiceCart } from "@shared/schema";

interface CartItem extends Service {
  quantity: number;
}

export default function ServiceCart() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    projectName: "",
    notes: "",
    budget: "",
    timeline: "",
    files: [] as string[],
  });

  // Fetch available services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Submit project request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async (data: InsertServiceCart) => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to submit request");
      }
      return await apiRequest("/api/cart/submit", "POST", {
        ...data,
        clientId: user.id,
        serviceIds: cart.map(item => item.id.toString()),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project request submitted successfully!",
      });
      setCart([]);
      setProjectDetails({
        projectName: "",
        notes: "",
        budget: "",
        timeline: "",
        files: [],
      });
      setIsCheckoutOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/client/requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = (service: Service) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        return prev.map(item =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
    toast({
      title: "Added to Cart",
      description: `${service.title} added to your project request`,
    });
  };

  const removeFromCart = (serviceId: number) => {
    setCart(prev => prev.filter(item => item.id !== serviceId));
  };

  const updateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmitRequest = () => {
    if (!projectDetails.projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one service to your cart",
        variant: "destructive",
      });
      return;
    }

    submitRequestMutation.mutate({
      projectName: projectDetails.projectName,
      notes: projectDetails.notes,
      budget: projectDetails.budget,
      timeline: projectDetails.timeline,
      files: projectDetails.files,
    });
  };

  if (!isAuthenticated) {
    return (
      <Card className="glass-effect border-border">
        <CardContent className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Login Required</h3>
          <p className="text-muted-foreground mb-4">
            Please log in to add services to your cart and submit project requests.
          </p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const cartItem = cart.find(item => item.id === service.id);
          return (
            <Card key={service.id} className="glass-effect border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {service.title}
                  {service.featured && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      Popular
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                {service.technologies && service.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  {cartItem ? (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(service.id, cartItem.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold">{cartItem.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(service.id, cartItem.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => addToCart(service)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="glass-effect border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCart([])}>
                Clear Cart
              </Button>
              <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-black hover:bg-primary/80">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Project Request Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Project Name *</label>
                      <Input
                        value={projectDetails.projectName}
                        onChange={(e) => setProjectDetails(prev => ({ ...prev, projectName: e.target.value }))}
                        placeholder="Enter your project name"
                        className="bg-white/10 border-border focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Budget Range</label>
                      <Select
                        value={projectDetails.budget}
                        onValueChange={(value) => setProjectDetails(prev => ({ ...prev, budget: value }))}
                      >
                        <SelectTrigger className="bg-white/10 border-border focus:border-primary">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border">
                          <SelectItem value="under-1k">Under $1,000</SelectItem>
                          <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                          <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                          <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                          <SelectItem value="25k-plus">$25,000+</SelectItem>
                          <SelectItem value="discuss">Let's discuss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Timeline</label>
                      <Select
                        value={projectDetails.timeline}
                        onValueChange={(value) => setProjectDetails(prev => ({ ...prev, timeline: value }))}
                      >
                        <SelectTrigger className="bg-white/10 border-border focus:border-primary">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border">
                          <SelectItem value="rush">Rush (1-2 weeks)</SelectItem>
                          <SelectItem value="standard">Standard (2-4 weeks)</SelectItem>
                          <SelectItem value="extended">Extended (1-2 months)</SelectItem>
                          <SelectItem value="flexible">Flexible timeline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Project Notes</label>
                      <Textarea
                        value={projectDetails.notes}
                        onChange={(e) => setProjectDetails(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Describe your project requirements, goals, and any specific details..."
                        className="bg-white/10 border-border focus:border-primary min-h-[100px]"
                      />
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Selected Services:</h4>
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span>{item.title} (×{item.quantity})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitRequest}
                      disabled={submitRequestMutation.isPending}
                      className="w-full bg-primary text-black hover:bg-primary/80"
                    >
                      {submitRequestMutation.isPending ? "Submitting..." : "Submit Project Request"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}