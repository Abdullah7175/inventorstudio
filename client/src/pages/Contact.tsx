import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { type InsertContactSubmission } from "@shared/schema";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    message: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactSubmission) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", service: "", message: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Office Locations",
      details: ["Lahore, Pakistan", "Dubai, UAE"]
    },
    {
      icon: Phone,
      title: "Phone Numbers",
      details: ["+92 XXX XXXXXXX", "+971 XX XXXXXXX"]
    },
    {
      icon: Mail,
      title: "Email Addresses",
      details: ["hello@inventerdesignstudio.com", "projects@inventerdesignstudio.com"]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat - Sun: 10:00 AM - 4:00 PM"]
    }
  ];

  const socialLinks = [
    { name: "WhatsApp", icon: "fab fa-whatsapp", href: "#", color: "hover:text-green-500" },
    { name: "LinkedIn", icon: "fab fa-linkedin", href: "#", color: "hover:text-blue-500" },
    { name: "Instagram", icon: "fab fa-instagram", href: "#", color: "hover:text-pink-500" },
    { name: "Facebook", icon: "fab fa-facebook", href: "#", color: "hover:text-blue-600" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get In <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to start your next project? Let's discuss how we can help bring your vision to life with our expert team and innovative solutions.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <AnimatedSection>
              <div className="space-y-8">
                <h2 className="text-3xl font-bold mb-8">
                  Contact <span className="gradient-text">Information</span>
                </h2>
                
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={info.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start"
                    >
                      <div className="text-primary text-2xl mr-4 mt-1">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Social Links */}
                <div className="pt-8">
                  <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => (
                      <motion.a
                        key={social.name}
                        href={social.href}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary transition-colors duration-300 ${social.color}`}
                        aria-label={social.name}
                      >
                        <i className={`${social.icon} text-xl`}></i>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection delay={0.2}>
              <Card className="glass-effect border-border">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <MessageSquare className="h-6 w-6 text-primary mr-3" />
                    <h2 className="text-2xl font-bold">Send us a Message</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/10 border-border focus:border-primary"
                        placeholder="Your Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/10 border-border focus:border-primary"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Service Needed
                      </label>
                      <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
                        <SelectTrigger className="bg-white/10 border-border focus:border-primary">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border">
                          <SelectItem value="web">Web Development</SelectItem>
                          <SelectItem value="mobile">Mobile App Development</SelectItem>
                          <SelectItem value="devops">DevOps & Cloud Solutions</SelectItem>
                          <SelectItem value="video">Video & Motion Graphics</SelectItem>
                          <SelectItem value="marketing">Digital Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Message *
                      </label>
                      <Textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="bg-white/10 border-border focus:border-primary resize-none"
                        placeholder="Tell us about your project..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={contactMutation.isPending}
                      className="w-full bg-primary text-black font-semibold hover:bg-primary/80 glow-animation"
                    >
                      {contactMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-4xl font-bold mb-8">
              Find <span className="gradient-text">Us</span>
            </h2>
            <div className="glass-effect rounded-2xl p-8">
              <p className="text-muted-foreground mb-6">
                We're located in two strategic locations to serve our global clientele better.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">🇵🇰 Lahore Office</h3>
                  <p className="text-muted-foreground">Our main headquarters and development hub</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">🇦🇪 Dubai Office</h3>
                  <p className="text-muted-foreground">Strategic location for Middle Eastern clients</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
