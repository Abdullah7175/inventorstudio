import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import DesignElements from "@/components/DesignElements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, Users, Clock, Award, Target, Eye } from "lucide-react";

export default function About() {
  const timeline = [
    {
      year: "2019",
      title: "Founded in Lahore",
      description: "Started as a small design studio with a vision to transform digital experiences."
    },
    {
      year: "2021",
      title: "Expanded Services",
      description: "Added development and digital marketing services to our portfolio."
    },
    {
      year: "2022",
      title: "UAE Office",
      description: "Opened our second office in Dubai to serve Middle Eastern clients."
    },
    {
      year: "2023",
      title: "100+ Projects",
      description: "Reached milestone of 100+ successful projects across various industries."
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Pioneered AI-powered design and development solutions for our clients."
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Innovation First",
      description: "We stay ahead of the curve by embracing new technologies and creative approaches."
    },
    {
      icon: Users,
      title: "Client-Centric",
      description: "Every decision we make is focused on delivering exceptional value to our clients."
    },
    {
      icon: Award,
      title: "Quality Excellence",
      description: "We maintain the highest standards in every project, no matter the size or scope."
    },
    {
      icon: Eye,
      title: "Transparent Process",
      description: "Open communication and clear processes ensure smooth project delivery."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* About page background elements */}
      <ServiceBackgroundElements density="light" opacity={0.04} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="gradient-text">Our Studio</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Founded with a vision to transform digital experiences, Inventor Design Studio has been at the forefront of innovation, delivering exceptional solutions across the globe.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <AnimatedSection>
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Design Studio Workspace"
                className="rounded-2xl shadow-2xl"
              />
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our <span className="gradient-text">Story</span>
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                With offices in Lahore and UAE, our international team combines creativity with technical expertise to bring your digital vision to life. We specialize in creating seamless user experiences that drive business growth.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Expert team of designers and developers",
                  "International presence in Lahore and UAE",
                  "24/7 support and maintenance",
                  "Agile development methodology"
                ].map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mr-4" />
                    <span className="text-muted-foreground">{point}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-effect border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">5+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </CardContent>
                </Card>
                <Card className="glass-effect border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">150+</div>
                    <div className="text-sm text-muted-foreground">Projects Delivered</div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-900 bg-opacity-30 relative">
        {/* Design elements for mission section */}
        <DesignElements />
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Mission & Vision</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <AnimatedSection>
              <Card className="glass-effect border-border h-full">
                <CardContent className="p-8">
                  <Target className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To empower businesses with innovative digital solutions that drive growth, enhance user experiences, and create lasting impact in the digital landscape.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <Card className="glass-effect border-border h-full">
                <CardContent className="p-8">
                  <Eye className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To be the leading design studio globally recognized for transforming ideas into exceptional digital experiences that shape the future of technology.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do and shape our company culture.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <AnimatedSection key={value.title} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass-effect p-8 rounded-2xl text-center group cursor-pointer h-full"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="text-primary mb-4 group-hover:animate-bounce"
                    >
                      <Icon className="h-12 w-12 mx-auto" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {value.description}
                    </p>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A timeline of growth, innovation, and milestones that define our story.
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <AnimatedSection key={item.year} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start mb-12 last:mb-0"
                >
                  <div className="flex flex-col items-center mr-8">
                    <div className="w-4 h-4 bg-primary rounded-full mb-2" />
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-24 bg-border" />
                    )}
                  </div>
                  <Card className="glass-effect border-border flex-1">
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="bg-primary/20 text-primary mb-3">
                        {item.year}
                      </Badge>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Locations</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Serving clients globally from our strategic locations in South Asia and the Middle East.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedSection>
              <Card className="glass-effect border-border">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Lahore, Pakistan</h3>
                  <p className="text-muted-foreground mb-4">Our headquarters and main development hub</p>
                  <p className="text-sm text-muted-foreground mb-4">First Floor, Plaza No. 8, H, A4, Commercial Area Block H Valencia, Lahore, 54000</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>📞 +92 XXX XXXXXXX</p>
                    <p>📧 lahore@inventerdesignstudio.com</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <Card className="glass-effect border-border">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Dubai, UAE</h3>
                  <p className="text-muted-foreground mb-4">Strategic office for Middle Eastern clients</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>📞 +971 XX XXXXXXX</p>
                    <p>📧 dubai@inventerdesignstudio.com</p>
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
