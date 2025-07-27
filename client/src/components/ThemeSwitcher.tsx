import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark" | "system";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      root.classList.add(systemDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const themes: { value: Theme; icon: any; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const currentIndex = themes.findIndex(t => t.value === theme);

  const handleThemeChange = () => {
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  if (!mounted) return null;

  const CurrentIcon = themes[currentIndex].icon;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleThemeChange}
      className="relative p-2 h-9 w-9 rounded-lg border-primary/20 hover:border-primary/40 transition-all duration-300 group"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <CurrentIcon className="h-4 w-4 text-foreground group-hover:text-primary transition-colors" />
        </motion.div>
      </AnimatePresence>
      
      {/* Smooth background transition */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100"
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </Button>
  );
}