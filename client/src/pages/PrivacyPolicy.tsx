import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, UserCheck, FileText, Calendar } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: UserCheck,
      content: [
        "Personal information such as name, email address, and phone number when you contact us or use our services",
        "Business information including company name, website, and project requirements",
        "Technical information such as IP address, browser type, and device information for website analytics",
        "Communication records including emails, chat messages, and support tickets",
        "Project files and content that you provide for our services"
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "To provide and improve our design and development services",
        "To communicate with you about projects, updates, and support",
        "To process payments and manage client accounts",
        "To analyze website usage and optimize user experience",
        "To comply with legal obligations and protect our rights"
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Shield,
      content: [
        "We do not sell, trade, or rent your personal information to third parties",
        "We may share information with trusted service providers who assist in our operations",
        "Information may be disclosed if required by law or to protect our rights",
        "Client project information is kept confidential and not shared without permission",
        "Anonymous, aggregated data may be used for business analytics"
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: [
        "We implement industry-standard security measures to protect your data",
        "All client communications and file transfers are encrypted",
        "Access to client information is restricted to authorized personnel only",
        "Regular security audits and updates are performed on our systems",
        "Secure backup systems ensure data integrity and availability"
      ]
    },
    {
      id: "client-rights",
      title: "Your Rights",
      icon: FileText,
      content: [
        "Access: You can request access to your personal information we hold",
        "Correction: You can request correction of inaccurate or incomplete information",
        "Deletion: You can request deletion of your personal information (subject to legal requirements)",
        "Portability: You can request a copy of your data in a structured format",
        "Objection: You can object to certain processing of your personal information"
      ]
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: Calendar,
      content: [
        "We use cookies to improve website functionality and user experience",
        "Analytics cookies help us understand how visitors use our website",
        "Performance cookies optimize website loading and functionality",
        "You can control cookie settings through your browser preferences",
        "Essential cookies are required for basic website functionality"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Privacy Policy background elements */}
      <ServiceBackgroundElements density="light" opacity={0.02} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use our services.
            </p>
            <div className="mt-8 text-sm text-muted-foreground">
              Last updated: December 2024
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <Card className="glass-effect border-border max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6">Introduction</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Welcome to Inventer Design Studio. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains our practices regarding the collection, use, and disclosure of information when you use our website and services.
                  </p>
                  <p>
                    By using our services, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
                  </p>
                  <p>
                    This policy applies to all visitors, users, and clients of Inventer Design Studio's website and services, regardless of location.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <AnimatedSection key={section.id} delay={index * 0.1}>
                  <Card className="glass-effect border-border">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <Icon className="h-8 w-8 text-primary mr-4" />
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                      </div>
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <Card className="glass-effect border-border max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-6">Contact Us About Privacy</h2>
                <p className="text-muted-foreground mb-8">
                  If you have any questions about this Privacy Policy, your rights, or how we handle your personal information, please don't hesitate to contact us.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">General Inquiries</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>📧 privacy@inventerdesignstudio.com</p>
                      <p>📞 +92 XXX XXXXXXX</p>
                      <p>📍 Lahore, Pakistan</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Data Protection Officer</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>📧 dpo@inventerdesignstudio.com</p>
                      <p>📞 +971 XX XXXXXXX</p>
                      <p>📍 Dubai, UAE</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    We will respond to all privacy-related inquiries within 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Updates Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <Card className="glass-effect border-border max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6">Policy Updates</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes to this policy, we will:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="list-disc">Update the "Last updated" date at the top of this policy</li>
                    <li className="list-disc">Notify existing clients of significant changes via email</li>
                    <li className="list-disc">Post the updated policy on our website</li>
                    <li className="list-disc">Provide a summary of changes if they are substantial</li>
                  </ul>
                  <p>
                    Your continued use of our services after any changes to this Privacy Policy constitutes your acceptance of the updated policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
