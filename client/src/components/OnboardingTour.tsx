import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, Target } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function OnboardingTour({ 
  steps, 
  isOpen, 
  onClose, 
  onComplete 
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return;

    const target = document.querySelector(steps[currentStep].target) as HTMLElement;
    if (target) {
      setTargetElement(target);
      
      // Scroll target into view
      target.scrollIntoView({ 
        behavior: "smooth", 
        block: "center",
        inline: "center"
      });
      
      // Calculate tooltip position
      const rect = target.getBoundingClientRect();
      const position = steps[currentStep].position;
      
      let x = 0, y = 0;
      
      switch (position) {
        case "top":
          x = rect.left + rect.width / 2;
          y = rect.top - 20;
          break;
        case "bottom":
          x = rect.left + rect.width / 2;
          y = rect.bottom + 20;
          break;
        case "left":
          x = rect.left - 20;
          y = rect.top + rect.height / 2;
          break;
        case "right":
          x = rect.right + 20;
          y = rect.top + rect.height / 2;
          break;
      }
      
      setTooltipPosition({ x, y });
    }
  }, [currentStep, isOpen, steps]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const position = steps[currentStep].position;
        
        let x = 0, y = 0;
        
        switch (position) {
          case "top":
            x = rect.left + rect.width / 2;
            y = rect.top - 20;
            break;
          case "bottom":
            x = rect.left + rect.width / 2;
            y = rect.bottom + 20;
            break;
          case "left":
            x = rect.left - 20;
            y = rect.top + rect.height / 2;
            break;
          case "right":
            x = rect.right + 20;
            y = rect.top + rect.height / 2;
            break;
        }
        
        setTooltipPosition({ x, y });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [targetElement, currentStep, steps, isOpen]);

  const handleNext = () => {
    const step = steps[currentStep];
    step.action?.();
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
    localStorage.setItem("onboarding-completed", "true");
  };

  const handleSkip = () => {
    onClose();
    localStorage.setItem("onboarding-skipped", "true");
  };

  if (!isOpen || !steps[currentStep]) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Spotlight on target element */}
          {targetElement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-50 pointer-events-none"
              style={{
                left: targetElement.getBoundingClientRect().left - 8,
                top: targetElement.getBoundingClientRect().top - 8,
                width: targetElement.getBoundingClientRect().width + 16,
                height: targetElement.getBoundingClientRect().height + 16,
                boxShadow: "0 0 0 4px rgba(214, 255, 42, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
                borderRadius: "8px",
              }}
            />
          )}
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Card className="w-80 border-primary/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="p-1 h-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {currentStepData.description}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-6">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                    >
                      Skip Tour
                    </Button>
                    <Button
                      onClick={handleNext}
                      size="sm"
                      className="bg-primary text-black hover:bg-primary/80 flex items-center gap-2"
                    >
                      {isLastStep ? "Complete" : "Next"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing onboarding state
export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    const hasSkippedOnboarding = localStorage.getItem("onboarding-skipped");
    
    if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
      // Show onboarding after a short delay
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);
  
  const startTour = () => setIsOpen(true);
  const closeTour = () => setIsOpen(false);
  
  return { isOpen, startTour, closeTour };
}