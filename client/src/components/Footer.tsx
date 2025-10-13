import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";
import DesignRushBadge from "@/assets/designrush-badge.svg";

interface FooterProps {
  showDesignRushBadge?: boolean;
}

export default function Footer({ showDesignRushBadge = true }: FooterProps) {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const serviceLinks = [
    { label: "Web Development", href: "/services" },
    { label: "Mobile Apps", href: "/services" },
    { label: "DevOps", href: "/services" },
    { label: "Video Production", href: "/services" },
    { label: "Digital Marketing", href: "/services" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { label: "Client Portal", href: "/client-portal" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Help Center", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 bg-opacity-50 py-12 border-t border-border">
      <div className="container mx-auto responsive-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 responsive-gap">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-2xl font-bold gradient-text mb-4">
              Inventer Design Studio
            </div>
            <p className="text-muted-foreground mb-6">
              Transforming digital visions into reality with innovative design and development solutions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer block"
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer block"
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer block"
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {showDesignRushBadge && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                
              >
                <a
                  href="https://www.designrush.com/agency/digital-marketing/texas/fort-worth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-300"
                >
                  <img
                    src={DesignRushBadge}
                    alt="Featured on the DesignRush list of top digital marketing agencies"
                    className="h-20 w-auto"
                  />
                </a>
              </motion.div>
            )}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-border mt-12 pt-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <p className="text-muted-foreground text-center lg:text-left responsive-text-sm">
              © 2025 Inventer Design Studio. All rights reserved.
            </p>
            
            {/* DesignRush Badge - Only show on public pages */}
            {/* {showDesignRushBadge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <a
                  href="https://www.designrush.com/agency/digital-marketing/texas/fort-worth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-300"
                >
                  <img
                    src={DesignRushBadge}
                    alt="Featured on the DesignRush list of top digital marketing agencies"
                    className="h-20 w-auto"
                  />
                </a>
              </motion.div>
            )} */}
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">First Floor, Plaza No. 8, H, A4, Commercial Area Block H Valencia, Lahore, 54000 • Dubai, UAE</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">hello@inventerdesignstudio.com</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
