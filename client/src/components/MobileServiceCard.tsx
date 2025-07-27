import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MobileServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  price?: string;
  isPopular?: boolean;
  onSelect?: () => void;
  delay?: number;
}

export default function MobileServiceCard({
  title,
  description,
  icon: Icon,
  features,
  price,
  isPopular = false,
  onSelect,
  delay = 0,
}: MobileServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="gpu-accelerated"
    >
      <Card className={`
        card-mobile relative h-full
        ${isPopular ? 'ring-2 ring-primary ring-opacity-50' : ''}
      `}>
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-primary text-black px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mx-auto mb-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
              <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
            </div>
          </motion.div>

          <CardTitle className="mobile-subheading text-center">
            {title}
          </CardTitle>
          
          <CardDescription className="responsive-text-sm text-center mt-2">
            {description}
          </CardDescription>

          {price && (
            <div className="mt-4">
              <div className="mobile-subheading text-primary">
                {price}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: delay + 0.1 + index * 0.1 }}
                className="flex items-start gap-2 responsive-text-sm"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {onSelect && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button
                onClick={onSelect}
                className="btn-mobile w-full focus-ring"
                variant={isPopular ? "default" : "outline"}
              >
                Select Service
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}