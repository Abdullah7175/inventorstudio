import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import AnimatedSection from "@/components/AnimatedSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle } from "lucide-react";
import { type Service } from "@shared/schema";

export default function Services() {
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const process = [
    {
      step: "01",
      title: "Discovery & Strategy",
      description: "We start by understanding your business goals, target audience, and project requirements through detailed consultation."
    },
    {
      step: "02",
      title: "Design & Planning",
      description: "Our creative team develops wireframes, mockups, and technical specifications tailored to your vision."
    },
    {
      step: "03",
      title: "Development & Testing",
      description: "Using agile methodology, we build your solution with regular updates and thorough quality assurance."
    },
    {
      step: "04",
      title: "Launch & Support",
      description: "We handle deployment and provide ongoing support to ensure your project's continued success."
    }
  ];

  const benefits = [
    "Dedicated project manager assigned to your account",
    "Regular progress updates and transparent communication",
    "Agile development methodology for faster delivery",
    "Quality assurance testing at every stage",
    "Post-launch support and maintenance included",
    "Scalable solutions that grow with your business",
    "Latest technology stack and industry best practices",
    "Money-back guarantee if not satisfied"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From concept to deployment, we provide comprehensive digital solutions tailored to your business needs. Each service is designed to drive growth and deliver exceptional results.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Process</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We follow a proven methodology that ensures project success from start to finish.
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            {process.map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 0.1}>
                <div className="flex items-start mb-8 last:mb-0">
                  <div className="flex flex-col items-center mr-8">
                    <div className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center font-bold text-lg mb-4">
                      {item.step}
                    </div>
                    {index < process.length - 1 && (
                      <div className="w-0.5 h-24 bg-border" />
                    )}
                  </div>
                  <Card className="glass-effect border-border flex-1">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Choose <span className="gradient-text">Our Services</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We don't just deliver projects - we build partnerships. Here's what sets us apart from the competition.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <AnimatedSection key={index} delay={index * 0.05}>
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <Card className="glass-effect border-border p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    Ready to Get Started?
                  </h3>
                  <p className="text-muted-foreground text-center mb-8">
                    Let's discuss your project requirements and how we can help bring your vision to life.
                  </p>
                  
                  <div className="space-y-4">
                    <Link href="/contact">
                      <Button className="w-full bg-primary text-black hover:bg-primary/80 glow-animation">
                        Get Free Consultation
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    
                    <Link href="/portfolio">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-black">
                        View Our Work
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="text-center mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      📞 +92 XXX XXXXXXX • 📧 hello@inventerdesignstudio.com
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
