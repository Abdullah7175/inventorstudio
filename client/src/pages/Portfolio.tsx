import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PortfolioItem from "@/components/PortfolioItem";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import TechStackBackground from "@/components/TechStackBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { type PortfolioProject } from "@shared/schema";

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const { data: projects = [], isLoading } = useQuery<PortfolioProject[]>({
    queryKey: ["/api/portfolio", selectedCategory],
  });

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "web", label: "Web Development" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "video", label: "Video Production" },
    { id: "marketing", label: "Digital Marketing" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Portfolio background elements */}
      <ServiceBackgroundElements density="medium" opacity={0.05} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our latest projects and see how we've helped businesses transform their digital presence with innovative solutions.
            </p>
          </AnimatedSection>

          {/* Category Filters */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={
                    selectedCategory === category.id
                      ? "bg-primary text-black hover:bg-primary/80"
                      : "border-primary text-primary hover:bg-primary hover:text-black"
                  }
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No projects found in this category. Please check back later or explore other categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <PortfolioItem
                  key={project.id}
                  project={project}
                  index={index}
                  onView={setSelectedProject}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">150+</div>
                <div className="text-muted-foreground">Projects Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Happy Clients</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Support Available</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="gradient-text">Project</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Let's create something amazing together. Contact us to discuss your project requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary text-black px-8 py-4 text-lg font-semibold hover:bg-primary/80 glow-animation">
                <a href="/contact">Get In Touch</a>
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary hover:text-black"
              >
                <a href="/services">View Services</a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

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
                
                <p className="text-muted-foreground text-lg">
                  {selectedProject.description}
                </p>
                
                <div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary mb-4">
                    Category: {selectedProject.category}
                  </Badge>
                </div>
                
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
                  <div className="flex gap-4">
                    <Button asChild className="bg-primary text-black hover:bg-primary/80">
                      <a 
                        href={selectedProject.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
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
