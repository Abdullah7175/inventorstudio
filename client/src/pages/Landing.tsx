import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Palette, Zap, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Background decoration - simplified */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full filter blur-3xl" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to{" "}
            <span className="gradient-text">Inventer Design Studio</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            Transform your digital vision with our cutting-edge design and development solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => (window.location.href = "/api/login")}
              className="bg-primary text-black px-8 py-4 text-lg font-semibold hover:bg-primary/80 group"
              size="lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const servicesSection = document.getElementById("services");
                if (servicesSection) {
                  servicesSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary hover:text-black transition-all duration-300"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">Our Studio</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We combine creativity with technical expertise to deliver exceptional digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Code,
                title: "Expert Development",
                description: "Cutting-edge web and mobile applications built with modern technologies."
              },
              {
                icon: Palette,
                title: "Creative Design",
                description: "Stunning visual designs that capture your brand's essence and engage users."
              },
              {
                icon: Zap,
                title: "Fast Delivery",
                description: "Agile development process ensuring quick turnaround without compromising quality."
              },
              {
                icon: Users,
                title: "24/7 Support",
                description: "Dedicated support team ensuring your project success from start to finish."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-colors duration-300"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your <span className="gradient-text">Digital Journey</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied clients who have transformed their digital presence with our expertise.
          </p>
          <Button
            onClick={() => (window.location.href = "/api/login")}
            className="bg-primary text-black px-8 py-4 text-lg font-semibold hover:bg-primary/80"
            size="lg"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}