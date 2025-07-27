import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Handshake, Calendar, Building, Users, Star } from "lucide-react";
import { type Partnership } from "@shared/schema";

// Default partnerships in case API returns empty
const defaultPartnerships: Partnership[] = [
  {
    id: 1,
    companyName: "Amazon Web Services",
    logo: "/api/placeholder/200/100",
    description: "Strategic cloud infrastructure partnership providing scalable, secure, and cost-effective solutions for our clients' enterprise applications.",
    partnershipType: "technology",
    website: "https://aws.amazon.com",
    status: "active",
    startDate: new Date("2022-03-15"),
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    companyName: "Google Cloud Platform",
    logo: "/api/placeholder/200/100",
    description: "Technology partnership leveraging Google's advanced AI/ML capabilities and cloud infrastructure for innovative digital solutions.",
    partnershipType: "technology",
    website: "https://cloud.google.com",
    status: "active",
    startDate: new Date("2022-06-10"),
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    companyName: "Microsoft Azure",
    logo: "/api/placeholder/200/100",
    description: "Enterprise-grade cloud solutions partnership enabling hybrid cloud architectures and enterprise integration capabilities.",
    partnershipType: "technology",
    website: "https://azure.microsoft.com",
    status: "active",
    startDate: new Date("2022-08-20"),
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    companyName: "Shopify Plus",
    logo: "/api/placeholder/200/100",
    description: "Strategic e-commerce partnership providing enterprise-level online store solutions with advanced customization capabilities.",
    partnershipType: "strategic",
    website: "https://www.shopify.com/plus",
    status: "active",
    startDate: new Date("2023-01-12"),
    order: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    companyName: "Adobe Creative Cloud",
    logo: "/api/placeholder/200/100",
    description: "Creative technology partnership providing access to industry-leading design tools and creative workflow solutions.",
    partnershipType: "technology",
    website: "https://www.adobe.com",
    status: "active",
    startDate: new Date("2021-11-05"),
    order: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    companyName: "Stripe",
    logo: "/api/placeholder/200/100",
    description: "Payment processing partnership enabling secure, scalable payment solutions for e-commerce and financial applications.",
    partnershipType: "integration",
    website: "https://stripe.com",
    status: "active",
    startDate: new Date("2023-04-18"),
    order: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    companyName: "Figma",
    logo: "/api/placeholder/200/100",
    description: "Design collaboration partnership streamlining our design workflow with real-time collaborative design and prototyping tools.",
    partnershipType: "technology",
    website: "https://www.figma.com",
    status: "active",
    startDate: new Date("2023-02-28"),
    order: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    companyName: "Vercel",
    logo: "/api/placeholder/200/100",
    description: "Deployment and hosting partnership providing seamless CI/CD workflows and edge computing solutions for modern web applications.",
    partnershipType: "technology",
    website: "https://vercel.com",
    status: "active",
    startDate: new Date("2023-06-14"),
    order: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const partnershipTypeColors = {
  technology: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  strategic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  integration: "bg-green-500/10 text-green-500 border-green-500/20",
  reseller: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const partnershipTypeLabels = {
  technology: "Technology Partner",
  strategic: "Strategic Partner",
  integration: "Integration Partner",
  reseller: "Reseller Partner",
};

export default function Partnerships() {
  const { data: partnerships = [], isLoading } = useQuery<Partnership[]>({
    queryKey: ["/api/partnerships"],
  });

  // Use API data if available, otherwise fall back to default partnerships
  const displayPartnerships = partnerships.length > 0 ? partnerships : defaultPartnerships;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading partnerships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Partnerships page background elements */}
      <ServiceBackgroundElements density="light" opacity={0.03} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our <span className="gradient-text">Partnerships</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We collaborate with industry-leading technology partners to deliver cutting-edge solutions and provide our clients with access to the best tools and platforms available.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Partnerships Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {displayPartnerships.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No partnerships available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPartnerships.map((partnership, index) => {
                const typeStyle = partnershipTypeColors[partnership.partnershipType as keyof typeof partnershipTypeColors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
                const typeLabel = partnershipTypeLabels[partnership.partnershipType as keyof typeof partnershipTypeLabels] || "Partner";
                
                return (
                  <AnimatedSection
                    key={partnership.id}
                    delay={index * 0.1}
                    className="h-full"
                  >
                    <Card className="h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                      <CardContent className="p-6 h-full flex flex-col">
                        {/* Partner Logo */}
                        <div className="relative mb-6">
                          <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center h-24">
                            <img
                              src={partnership.logo || "/api/placeholder/200/100"}
                              alt={partnership.companyName}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <Badge className={`${typeStyle} border`}>
                            <Handshake className="h-3 w-3 mr-1" />
                            {typeLabel}
                          </Badge>
                        </div>

                        {/* Partnership Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-3 text-foreground">
                            {partnership.companyName}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                            {partnership.description}
                          </p>

                          {/* Partnership Details */}
                          <div className="space-y-2 mb-4">
                            {partnership.startDate && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                  Partnership since {new Date(partnership.startDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-4 w-4 mr-2" />
                              <span className="capitalize">
                                {partnership.status} Partnership
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Visit Website Button */}
                        {partnership.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                            onClick={() => partnership.website && window.open(partnership.website, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Website
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

      {/* Partnership Benefits */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Partnership <span className="gradient-text">Benefits</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our strategic partnerships enable us to deliver superior value and cutting-edge solutions to our clients.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedSection delay={0.1}>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Access</h3>
                <p className="text-muted-foreground">
                  Exclusive access to enterprise-grade tools and platforms for superior project delivery.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                <p className="text-muted-foreground">
                  Direct access to partner technical support teams and specialized expertise.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cost Efficiency</h3>
                <p className="text-muted-foreground">
                  Partner pricing and volume discounts passed directly to our clients.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation Access</h3>
                <p className="text-muted-foreground">
                  Early access to beta features and cutting-edge technology innovations.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">25+</div>
                <div className="text-muted-foreground">Technology Partners</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5</div>
                <div className="text-muted-foreground">Strategic Alliances</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Partner Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">3+</div>
                <div className="text-muted-foreground">Years Average Partnership</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}