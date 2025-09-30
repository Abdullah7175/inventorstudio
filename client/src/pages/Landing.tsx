import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Palette, Zap, Users } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import Footer from "@/components/Footer";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Landing page background elements */}
      <ServiceBackgroundElements density="medium" opacity={0.04} />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              y: [-20, 20, -20],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              y: [20, -20, 20],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full filter blur-3xl"
          />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Welcome to{" "}
            <span className="gradient-text">Inventor Design Studio</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto"
          >
            Transform your digital vision with our cutting-edge design and development solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-primary text-black px-8 py-4 text-lg font-semibold hover:bg-primary/80 glow-animation group"
              size="lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {/* Admin access removed for security */}

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
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">Our Studio</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We combine creativity with technical expertise to deliver exceptional digital experiences.
            </p>
          </motion.div>

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
                description: "Dedicated support team available around the clock for your peace of mind."
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="glass-effect p-8 rounded-2xl text-center group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="text-primary mb-4 group-hover:animate-bounce"
                  >
                    <Icon className="h-12 w-12 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="gradient-text">Project</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join hundreds of satisfied clients who have transformed their digital presence with our expertise.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-primary text-black px-8 py-4 text-lg font-semibold hover:bg-primary/80 glow-animation group"
              size="lg"
            >
              Sign In to Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
