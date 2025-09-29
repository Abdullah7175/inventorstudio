import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  UserCheck, 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  Scale, 
  Mail, 
  MapPin,
  CheckCircle,
  Globe
} from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: "By accessing or using our website, services, or products, you confirm that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy."
    },
    {
      id: "eligibility",
      title: "Eligibility",
      icon: UserCheck,
      content: [
        "You must be at least 18 years old or the legal age of majority in your jurisdiction.",
        "By using our services on behalf of a business or organization, you represent that you have the authority to bind that entity to these Terms."
      ]
    },
    {
      id: "services",
      title: "Services Provided",
      icon: Globe,
      content: [
        "We provide, but are not limited to, the following services:",
        "Website and application development",
        "Digital marketing and social media management",
        "SEO and online visibility solutions",
        "DevOps and IT infrastructure services",
        "Graphic design, branding, and creative production",
        "Video pre-production and post-production editing",
        "The scope of work for each project will be outlined in a separate written agreement, quotation, or invoice."
      ]
    },
    {
      id: "user-responsibilities",
      title: "User Responsibilities",
      icon: UserCheck,
      content: [
        "You agree to use our services lawfully and not for fraudulent, harmful, or illegal activities.",
        "You will provide accurate, complete, and current information when engaging with us.",
        "You are responsible for maintaining the confidentiality of any account credentials provided to you."
      ]
    },
    {
      id: "payments",
      title: "Payments & Billing",
      icon: CreditCard,
      content: [
        "All fees are payable in accordance with agreed invoices, contracts, or proposals.",
        "Payments must be made on time. Late payments may incur penalties.",
        "Refunds, if applicable, are subject to the terms outlined in individual service agreements.",
        "We reserve the right to suspend or terminate services for overdue accounts."
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: Shield,
      content: [
        "All content, graphics, designs, code, and creative work produced by us remain our intellectual property unless expressly transferred under a written agreement.",
        "Clients retain rights to materials specifically developed for them upon full payment.",
        "You may not copy, distribute, or use our content without prior written consent."
      ]
    },
    {
      id: "third-party",
      title: "Third-Party Services",
      icon: Globe,
      content: "We may integrate or rely on third-party tools (e.g., hosting providers, APIs, cloud services). We are not responsible for interruptions, errors, or damages caused by these third-party providers."
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: AlertTriangle,
      content: [
        "Our services are provided \"as is\" and \"as available.\"",
        "We do not guarantee uninterrupted, error-free service or specific business results.",
        "We are not liable for any indirect, incidental, consequential, or punitive damages.",
        "Our total liability under any claim shall not exceed the amount you paid for the service in question."
      ]
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: Shield,
      content: "You agree to indemnify, defend, and hold harmless Inventor Design Studio and its employees, officers, and partners from any claims, liabilities, damages, or expenses arising from your use of our services or breach of these Terms."
    },
    {
      id: "termination",
      title: "Termination",
      icon: AlertTriangle,
      content: [
        "We may suspend or terminate services at any time if you breach these Terms.",
        "Upon termination, your right to access our services will end immediately, but payment obligations will remain."
      ]
    },
    {
      id: "governing-law",
      title: "Governing Law & Jurisdiction",
      icon: Scale,
      content: "These Terms are governed by the laws of Pakistan. Any disputes will be resolved in the courts of Lahore, Punjab."
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: FileText,
      content: "We reserve the right to update or modify these Terms at any time. Updates will be posted on this page with a revised \"Last Updated\" date. Continued use of our services means you accept the updated Terms."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Terms of Service background elements */}
      <ServiceBackgroundElements density="light" opacity={0.02} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              📑 Terms of Service <span className="gradient-text">(ToS)</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Welcome to Inventor Design Studio ("Company," "we," "our," or "us"). By using our website [www.inventerdesignstudio.com] and our related services, you ("User," "you," or "your") agree to the following Terms of Service. Please read carefully. If you do not agree with these terms, you must not use our services.
            </p>
            <div className="mt-8 text-sm text-muted-foreground">
              Last Updated: September 21, 2025
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isArray = Array.isArray(section.content);
              
              return (
                <AnimatedSection key={section.id} delay={index * 0.1}>
                  <Card className="glass-effect border-border">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <Icon className="h-8 w-8 text-primary mr-4" />
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                      </div>
                      
                      {isArray ? (
                        <div className="space-y-3">
                          {(section.content as string[]).map((item, itemIndex) => {
                            const isIntroText = itemIndex === 0 && item.includes("We provide, but are not limited to");
                            
                            return isIntroText ? (
                              <p key={itemIndex} className="text-muted-foreground mb-4">
                                {item}
                              </p>
                            ) : (
                              <div key={itemIndex} className="flex items-start">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4 flex-shrink-0" />
                                <span className="text-muted-foreground">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{section.content as string}</p>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}