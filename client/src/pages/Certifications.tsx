import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, ExternalLink, Shield, Code, Palette, Cloud, Lock } from "lucide-react";
import { type Certification } from "@shared/schema";

// Default certifications in case API returns empty
const defaultCertifications: Certification[] = [
  {
    id: 1,
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    description: "Demonstrates expertise in designing distributed systems and applications on AWS platform with focus on scalability, security, and cost optimization.",
    certificateImage: "/api/placeholder/400/300",
    issueDate: new Date("2023-06-15"),
    expiryDate: new Date("2026-06-15"),
    credentialId: "AWS-CSA-2023-001",
    verificationUrl: "https://aws.amazon.com/verification",
    category: "cloud",
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "Google Cloud Professional Developer",
    issuer: "Google Cloud",
    description: "Validates skills in developing scalable applications using Google Cloud technologies and best practices for cloud-native development.",
    certificateImage: "/api/placeholder/400/300",
    issueDate: new Date("2023-08-20"),
    expiryDate: new Date("2025-08-20"),
    credentialId: "GCP-PD-2023-002",
    verificationUrl: "https://cloud.google.com/certification",
    category: "cloud",
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    title: "Certified Information Security Manager (CISM)",
    issuer: "ISACA",
    description: "Demonstrates expertise in information security management, governance, incident management, and risk management frameworks.",
    certificateImage: "/api/placeholder/400/300",
    issueDate: new Date("2023-04-10"),
    expiryDate: new Date("2026-04-10"),
    credentialId: "CISM-2023-003",
    verificationUrl: "https://www.isaca.org/credentialing",
    category: "security",
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    title: "React Professional Developer",
    issuer: "Meta",
    description: "Advanced certification in React development including hooks, state management, performance optimization, and modern React patterns.",
    certificateImage: "/api/placeholder/400/300",
    issueDate: new Date("2023-09-05"),
    expiryDate: null,
    credentialId: "META-REACT-2023-004",
    verificationUrl: "https://developers.facebook.com/certification",
    category: "web",
    order: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    title: "Adobe Certified Expert - Photoshop",
    issuer: "Adobe",
    description: "Demonstrates mastery of Adobe Photoshop tools and techniques for professional graphic design, photo editing, and digital artwork creation.",
    certificateImage: "/api/placeholder/400/300",
    issueDate: new Date("2023-03-12"),
    expiryDate: new Date("2025-03-12"),
    credentialId: "ADOBE-PS-2023-005",
    verificationUrl: "https://www.adobe.com/training-and-certification",
    category: "design",
    order: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    title: "Flutter Mobile Developer Certification",
    issuer: "Google",
    description: "Validates expertise in Flutter framework for cross-platform mobile app development with native performance and beautiful UIs.",
    certificateImage: "/api/placeholder/400/300",
    issueDate: new Date("2023-07-18"),
    expiryDate: null,
    credentialId: "FLUTTER-2023-006",
    verificationUrl: "https://developers.google.com/certification",
    category: "mobile",
    order: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const categoryIcons = {
  web: Code,
  mobile: Code,
  design: Palette,
  cloud: Cloud,
  security: Lock,
};

const categoryColors = {
  web: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mobile: "bg-green-500/10 text-green-500 border-green-500/20",
  design: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  cloud: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  security: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function Certifications() {
  const { data: certifications = [], isLoading } = useQuery<Certification[]>({
    queryKey: ["/api/certifications"],
  });

  // Use API data if available, otherwise fall back to default certifications
  const displayCertifications = certifications.length > 0 ? certifications : defaultCertifications;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Certifications page background elements */}
      <ServiceBackgroundElements density="light" opacity={0.03} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our <span className="gradient-text">Certifications</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our team maintains industry-leading certifications to ensure we deliver the highest quality solutions using the latest technologies and best practices.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {displayCertifications.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No certifications available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCertifications.map((cert, index) => {
                const IconComponent = categoryIcons[cert.category as keyof typeof categoryIcons] || Award;
                const categoryStyle = categoryColors[cert.category as keyof typeof categoryColors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
                
                return (
                  <AnimatedSection
                    key={cert.id}
                    delay={index * 0.1}
                    className="h-full"
                  >
                    <Card className="h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                      <CardContent className="p-6 h-full flex flex-col">
                        {/* Certificate Image */}
                        {cert.certificateImage && (
                          <div className="relative mb-4 rounded-lg overflow-hidden">
                            <img
                              src={cert.certificateImage}
                              alt={cert.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute top-4 right-4">
                              <Badge className={`${categoryStyle} border`}>
                                <IconComponent className="h-3 w-3 mr-1" />
                                {cert.category}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Certificate Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 text-foreground">
                            {cert.title}
                          </h3>
                          
                          <p className="text-primary font-medium mb-3">
                            {cert.issuer}
                          </p>
                          
                          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                            {cert.description}
                          </p>

                          {/* Certificate Details */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>
                                Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            
                            {cert.expiryDate && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                  Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            {cert.credentialId && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Shield className="h-4 w-4 mr-2" />
                                <span className="font-mono text-xs">
                                  ID: {cert.credentialId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Verification Link */}
                        {cert.verificationUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                            onClick={() => cert.verificationUrl && window.open(cert.verificationUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify Certificate
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                );
              })}
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
                <div className="text-4xl font-bold text-primary mb-2">15+</div>
                <div className="text-muted-foreground">Active Certifications</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5</div>
                <div className="text-muted-foreground">Technology Categories</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <div className="text-muted-foreground">Years Average Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Verified Credentials</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}