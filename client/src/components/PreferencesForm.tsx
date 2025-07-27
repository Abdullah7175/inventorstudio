import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Target, Palette, Clock, DollarSign, Users, Building } from "lucide-react";

const preferencesSchema = z.object({
  industry: z.string().optional(),
  businessType: z.string().optional(),
  stylePreference: z.string().optional(),
  colorScheme: z.string().optional(),
  targetAudience: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  features: z.array(z.string()).default([]),
  inspiration: z.string().optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export default function PreferencesForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["/api/recommendations/preferences"],
    retry: false,
  });

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      industry: "",
      businessType: "",
      stylePreference: "",
      colorScheme: "",
      targetAudience: "",
      budget: "",
      timeline: "",
      features: [],
      inspiration: "",
    },
  });

  // Reset form when preferences data loads
  useState(() => {
    if (preferences && typeof preferences === 'object') {
      const prefs = preferences as any;
      form.reset({
        industry: prefs.industry || "",
        businessType: prefs.businessType || "",
        stylePreference: prefs.stylePreference || "",
        colorScheme: prefs.colorScheme || "",
        targetAudience: prefs.targetAudience || "",
        budget: prefs.budget || "",
        timeline: prefs.timeline || "",
        features: prefs.features || [],
        inspiration: prefs.inspiration || "",
      });
      setSelectedFeatures(prefs.features || []);
    }
  });

  const savePreferences = useMutation({
    mutationFn: async (data: PreferencesFormData) => {
      const response = await fetch("/api/recommendations/preferences", {
        method: "POST",
        body: JSON.stringify({ ...data, features: selectedFeatures }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to save preferences");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences Saved",
        description: "Your design preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PreferencesFormData) => {
    savePreferences.mutate(data);
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce", 
    "Fashion", "Food & Beverage", "Real Estate", "Non-profit", "Entertainment"
  ];

  const businessTypes = [
    "Startup", "Small Business", "Corporate", "Personal Brand", "Non-profit", "Agency"
  ];

  const stylePreferences = [
    "Modern", "Classic", "Minimalist", "Bold", "Creative", "Professional"
  ];

  const colorSchemes = [
    "Bright & Vibrant", "Muted & Subtle", "Monochrome", "Pastel", "Dark Theme"
  ];

  const targetAudiences = [
    "Young Adults", "Professionals", "Families", "Seniors", "Luxury Market", "General Public"
  ];

  const budgets = [
    "Basic", "Standard", "Premium", "Enterprise"
  ];

  const timelines = [
    "Rush (1-2 weeks)", "Standard (3-4 weeks)", "Extended (1-2 months)"
  ];

  const features = [
    "E-commerce", "Blog", "Portfolio", "Booking System", "User Accounts", 
    "Payment Processing", "Analytics", "Social Media Integration", "SEO Optimization", 
    "Mobile App", "Custom Forms", "Live Chat"
  ];

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading preferences...</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Design Preferences
        </CardTitle>
        <p className="text-muted-foreground">
          Tell us about your project to get personalized design recommendations
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Industry
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry.toLowerCase()}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Type */}
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Business Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Style Preference */}
              <FormField
                control={form.control}
                name="stylePreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Style Preference
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select design style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stylePreferences.map((style) => (
                          <SelectItem key={style} value={style.toLowerCase()}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color Scheme */}
              <FormField
                control={form.control}
                name="colorScheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Scheme</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorSchemes.map((scheme) => (
                          <SelectItem key={scheme} value={scheme.toLowerCase()}>
                            {scheme}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Audience */}
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Target Audience
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {targetAudiences.map((audience) => (
                          <SelectItem key={audience} value={audience.toLowerCase()}>
                            {audience}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Budget Range
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgets.map((budget) => (
                          <SelectItem key={budget} value={budget.toLowerCase()}>
                            {budget}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timeline */}
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timeline
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timelines.map((timeline) => (
                          <SelectItem key={timeline} value={timeline.toLowerCase()}>
                            {timeline}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Features */}
            <div>
              <FormLabel className="text-base mb-4 block">Required Features</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={selectedFeatures.includes(feature.toLowerCase())}
                      onCheckedChange={() => handleFeatureToggle(feature.toLowerCase())}
                    />
                    <label htmlFor={feature} className="text-sm font-medium leading-none">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspiration */}
            <FormField
              control={form.control}
              name="inspiration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspiration</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about websites, brands, or designs you like..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={savePreferences.isPending}
            >
              {savePreferences.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}