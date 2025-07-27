import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import FAQItem from "@/components/FAQItem";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { type FaqItem } from "@shared/schema";

// Default FAQ items in case the API returns empty
const defaultFAQs: FaqItem[] = [
  {
    id: 1,
    question: "What is your typical project timeline?",
    answer: "Project timelines vary depending on complexity and scope. Typically, a standard website takes 4-6 weeks, mobile apps 8-12 weeks, and complex enterprise solutions 12-16 weeks. We provide detailed timelines during our initial consultation.",
    order: 1
  },
  {
    id: 2,
    question: "What formats do you deliver final projects in?",
    answer: "We deliver projects in industry-standard formats including source code, design files (Figma, Adobe), documentation, deployment guides, and training materials. All deliverables are provided through our secure client portal.",
    order: 2
  },
  {
    id: 3,
    question: "Do you provide post-launch support?",
    answer: "Yes, we offer comprehensive post-launch support including bug fixes, updates, maintenance, and feature enhancements. Our support packages range from basic maintenance to full managed services.",
    order: 3
  },
  {
    id: 4,
    question: "What are your payment terms?",
    answer: "We typically work with a 50% upfront payment and 50% upon completion for smaller projects. Larger projects may be broken into milestones. We accept bank transfers, online payments, and cryptocurrency.",
    order: 4
  },
  {
    id: 5,
    question: "Do you work with international clients?",
    answer: "Absolutely! With offices in Lahore and Dubai, we serve clients globally. We're experienced in working across different time zones and have established processes for remote collaboration.",
    order: 5
  },
  {
    id: 6,
    question: "What technologies do you specialize in?",
    answer: "We specialize in modern web technologies like React, Node.js, Python, mobile development with Flutter and React Native, cloud platforms (AWS, Azure), and design tools like Figma and Adobe Creative Suite.",
    order: 6
  },
  {
    id: 7,
    question: "Can you help with ongoing maintenance?",
    answer: "Yes, we provide ongoing maintenance services including security updates, performance optimization, content updates, and technical support. We offer flexible maintenance packages based on your needs.",
    order: 7
  },
  {
    id: 8,
    question: "How do you ensure project quality?",
    answer: "We follow industry best practices including code reviews, automated testing, quality assurance testing, and regular client feedback loops. Every project goes through rigorous testing before deployment.",
    order: 8
  }
];

export default function FAQ() {
  const { data: faqItems = [], isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/faq"],
  });

  // Use API data if available, otherwise fall back to default FAQs
  const displayFAQs = faqItems.length > 0 ? faqItems : defaultFAQs;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* FAQ page background elements */}
      <ServiceBackgroundElements density="light" opacity={0.02} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get answers to the most common questions about our services, processes, and how we can help your business succeed.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {displayFAQs.map((item, index) => (
              <FAQItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Still Have Questions */}
              <Card className="glass-effect border-border">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">
                    Still Have Questions?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Can't find the answer you're looking for? Our support team is here to help you with any questions or concerns.
                  </p>
                  <Link href="/contact">
                    <Button className="bg-primary text-black hover:bg-primary/80 group">
                      Contact Support
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Documentation */}
              <Card className="glass-effect border-border">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">
                    Need More Information?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Explore our detailed service offerings and learn more about how we can help transform your digital presence.
                  </p>
                  <Link href="/services">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black group">
                      View Services
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Popular <span className="gradient-text">Topics</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Quick links to commonly searched topics and information.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Project Timeline",
                "Payment Terms",
                "Support & Maintenance",
                "Technology Stack",
                "International Projects",
                "Quality Assurance"
              ].map((topic, index) => (
                <AnimatedSection key={topic} delay={index * 0.1}>
                  <button className="bg-primary/20 text-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-black transition-colors duration-300">
                    {topic}
                  </button>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
