import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, UserCheck, FileText, Calendar, Mail, MapPin } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: UserCheck,
      content: [
        "We may collect the following types of information:",
        "Personal Information: Name, email address, phone number, company name, billing details.",
        "Technical Information: IP address, browser type, operating system, device details, cookies, and analytics data.",
        "Usage Data: How you interact with our website and services.",
        "Client Project Data: Files, documents, or materials you provide for project completion."
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "We use the collected data to:",
        "Deliver and improve our services.",
        "Communicate with you regarding inquiries, contracts, and updates.",
        "Process payments and invoices.",
        "Send marketing or promotional material (with your consent).",
        "Ensure compliance with legal and security requirements."
      ]
    },
    {
      id: "information-sharing",
      title: "Sharing of Information",
      icon: Shield,
      content: [
        "We do not sell or rent your personal data. We may share information with:",
        "Trusted third-party vendors (e.g., hosting, payment processors, cloud storage).",
        "Legal authorities if required by law or court order.",
        "Business transfers in the event of a merger, acquisition, or sale of assets."
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: [
        "We use industry-standard measures (encryption, firewalls, secure servers) to protect your information.",
        "However, no system is 100% secure, and we cannot guarantee absolute security."
      ]
    },
    {
      id: "cookies-tracking",
      title: "Cookies & Tracking Technologies",
      icon: Calendar,
      content: "Our website uses cookies and similar technologies to improve user experience, analyze traffic, and personalize content. You can disable cookies in your browser settings, but some site features may not function properly."
    },
    {
      id: "client-rights",
      title: "Your Rights",
      icon: FileText,
      content: [
        "Depending on your location, you may have rights to:",
        "Access, correct, or delete your personal data.",
        "Withdraw consent for marketing communications.",
        "Request a copy of the data we hold about you.",
        "File a complaint with your local data protection authority.",
        "To exercise these rights, contact us at info@inventerdesignstudio.com."
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Calendar,
      content: "We retain your data only as long as necessary to provide our services, comply with legal obligations, and resolve disputes."
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: MapPin,
      content: "If you access our services from outside Pakistan, your data may be transferred to servers located in other countries with different data protection laws."
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      icon: UserCheck,
      content: "Our services are not directed to children under 13. We do not knowingly collect personal data from children."
    },
    {
      id: "policy-changes",
      title: "Changes to Privacy Policy",
      icon: FileText,
      content: "We may update this Privacy Policy at any time. Updates will be posted on this page with the \"Last Updated\" date."
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
              📑 Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              At Inventor Design Studio, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
            </p>
            <div className="mt-8 text-sm text-muted-foreground">
              Last Updated: September 21, 2025
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Policy Sections */}
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
                            const isIntroText = itemIndex === 0 && (
                              item.includes("We may collect") || 
                              item.includes("We use the collected") || 
                              item.includes("We do not sell") || 
                              item.includes("Depending on your location")
                            );
                            
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

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <Card className="glass-effect border-border max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
                <p className="text-muted-foreground mb-8">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>📧 Email: info@inventerdesignstudio.com</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>📍 Address: First Floor, Plaza No. 8, H, A4, Commercial Area Block H Valencia, Lahore, Pakistan</span>
                  </div>
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