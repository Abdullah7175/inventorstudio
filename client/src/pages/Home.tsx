import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import PortfolioItem from "@/components/PortfolioItem";
import BlogCard from "@/components/BlogCard";
import AnimatedSection from "@/components/AnimatedSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { type Service, type PortfolioProject, type BlogPost } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const { data: featuredServices = [] } = useQuery<Service[]>({
    queryKey: ["/api/services/featured"],
  });

  const { data: featuredProjects = [] } = useQuery<PortfolioProject[]>({
    queryKey: ["/api/portfolio/featured"],
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog", { published: true }],
  });

  const testimonials = [
    {
      name: "Sarah Mitchell",
      company: "TechStart",
      avatar: "SM",
      rating: 5,
      content: "Inventer Design Studio transformed our online presence completely. Their attention to detail and innovative approach exceeded our expectations."
    },
    {
      name: "Michael Johnson",
      company: "FitLife",
      avatar: "MJ",
      rating: 5,
      content: "The mobile app they developed for us has been a game-changer. Professional, responsive, and delivered on time."
    },
    {
      name: "Alex Rodriguez",
      company: "BrandCorp",
      avatar: "AR",
      rating: 5,
      content: "Their digital marketing campaign doubled our online engagement. Highly recommend their services!"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <Hero />

      {/* Featured Services */}
      <AnimatedSection className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From concept to deployment, we provide comprehensive digital solutions tailored to your business needs.
            </p>
          </div>

          <div className="grid responsive-grid-cols-4 responsive-gap mb-12">
            {featuredServices.slice(0, 4).map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/services">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-black group"
              >
                View All Services
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Portfolio Preview */}
      <AnimatedSection className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Portfolio</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our latest projects and see how we've helped businesses transform their digital presence.
            </p>
          </div>

          <div className="grid responsive-grid-cols responsive-gap mb-12">
            {featuredProjects.slice(0, 6).map((project, index) => (
              <PortfolioItem 
                key={project.id} 
                project={project} 
                index={index}
                onView={setSelectedProject}
              />
            ))}
          </div>

          <div className="text-center">
            <Link href="/portfolio">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-black group"
              >
                View Full Portfolio
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Client <span className="gradient-text">Testimonials</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Don't just take our word for it - hear what our clients have to say about working with us.
            </p>
          </div>

          <div className="grid responsive-grid-cols responsive-gap">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="glass-effect border-border h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="flex text-primary">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <Quote className="h-8 w-8 text-primary mb-4" />
                    
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Blog Preview */}
      <AnimatedSection className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Latest <span className="gradient-text">Insights</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay updated with the latest trends, tips, and insights from the world of digital design and development.
            </p>
          </div>

          <div className="grid responsive-grid-cols responsive-gap mb-12">
            {blogPosts.slice(0, 3).map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/blog">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-black group"
              >
                Read More Articles
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20" id="contact">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="gradient-text">Project</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Let's discuss how we can help bring your vision to life with our expert team and innovative solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-primary text-black px-8 py-4 text-lg font-semibold hover:bg-primary/80 glow-animation group">
                  Get In Touch
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/client-portal">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary hover:text-black"
                >
                  Client Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Project Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="glass-effect border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl gradient-text">
                  {selectedProject.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <p className="text-muted-foreground">
                  {selectedProject.description}
                </p>
                
                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="bg-primary/20 text-primary"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProject.projectUrl && (
                  <div>
                    <Button asChild className="bg-primary text-black hover:bg-primary/80">
                      <a 
                        href={selectedProject.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View Live Project
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
