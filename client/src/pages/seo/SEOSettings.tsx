import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save, 
  Globe, 
  Search, 
  FileText, 
  BarChart3,
  Eye,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string[];
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
  socialMediaTitle: string;
  socialMediaDescription: string;
  socialMediaImage: string;
  autoGenerateSitemaps: boolean;
  enableRobotsTxt: boolean;
  enableSchemaMarkup: boolean;
  enableOpenGraph: boolean;
  enableTwitterCards: boolean;
}

export default function SEOSettings() {
  const [settings, setSettings] = useState<SEOSettings>({
    siteName: 'Inventor Design Studio',
    siteDescription: 'Transform your digital vision with expert web development and design services',
    siteUrl: 'https://inventerdesignstudio.com',
    defaultMetaTitle: 'Inventor Design Studio - Transform Your Digital Vision',
    defaultMetaDescription: 'Expert web development, mobile apps, UI/UX design, and digital marketing solutions',
    defaultKeywords: ['web development', 'mobile apps', 'UI/UX design', 'digital marketing'],
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    socialMediaTitle: 'Inventor Design Studio',
    socialMediaDescription: 'Transform your digital vision with expert web development and design services',
    socialMediaImage: '',
    autoGenerateSitemaps: true,
    enableRobotsTxt: true,
    enableSchemaMarkup: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "SEO settings saved successfully",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SEOSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addKeyword = () => {
    const keyword = prompt('Enter a new keyword:');
    if (keyword && !settings.defaultKeywords.includes(keyword)) {
      updateSetting('defaultKeywords', [...settings.defaultKeywords, keyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    updateSetting('defaultKeywords', settings.defaultKeywords.filter(k => k !== keyword));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">Configure your website's SEO settings and optimization</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Basic Site Information</span>
            </CardTitle>
            <CardDescription>Configure your website's basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                placeholder="Your site name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                placeholder="Brief description of your site"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => updateSetting('siteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Meta Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Default Meta Tags</span>
            </CardTitle>
            <CardDescription>Set default meta tags for your pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
              <Input
                id="defaultMetaTitle"
                value={settings.defaultMetaTitle}
                onChange={(e) => updateSetting('defaultMetaTitle', e.target.value)}
                placeholder="Default page title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
              <textarea
                id="defaultMetaDescription"
                value={settings.defaultMetaDescription}
                onChange={(e) => updateSetting('defaultMetaDescription', e.target.value)}
                placeholder="Default page description"
                className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Keywords</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {settings.defaultKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addKeyword}>
                Add Keyword
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Analytics & Tracking</span>
            </CardTitle>
            <CardDescription>Configure analytics and tracking services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={settings.googleAnalyticsId}
                onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleSearchConsoleId">Google Search Console Property</Label>
              <Input
                id="googleSearchConsoleId"
                value={settings.googleSearchConsoleId}
                onChange={(e) => updateSetting('googleSearchConsoleId', e.target.value)}
                placeholder="Property URL"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Social Media</span>
            </CardTitle>
            <CardDescription>Configure social media sharing settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="socialMediaTitle">Social Media Title</Label>
              <Input
                id="socialMediaTitle"
                value={settings.socialMediaTitle}
                onChange={(e) => updateSetting('socialMediaTitle', e.target.value)}
                placeholder="Title for social media sharing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialMediaDescription">Social Media Description</Label>
              <textarea
                id="socialMediaDescription"
                value={settings.socialMediaDescription}
                onChange={(e) => updateSetting('socialMediaDescription', e.target.value)}
                placeholder="Description for social media sharing"
                className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialMediaImage">Social Media Image URL</Label>
              <Input
                id="socialMediaImage"
                value={settings.socialMediaImage}
                onChange={(e) => updateSetting('socialMediaImage', e.target.value)}
                placeholder="https://yourwebsite.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical SEO */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Technical SEO</span>
            </CardTitle>
            <CardDescription>Configure technical SEO features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate Sitemaps</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate XML sitemaps
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoGenerateSitemaps}
                    onCheckedChange={(checked) => updateSetting('autoGenerateSitemaps', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable robots.txt</Label>
                    <p className="text-sm text-muted-foreground">
                      Generate and serve robots.txt file
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRobotsTxt}
                    onCheckedChange={(checked) => updateSetting('enableRobotsTxt', checked)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Schema Markup</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable structured data markup
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableSchemaMarkup}
                    onCheckedChange={(checked) => updateSetting('enableSchemaMarkup', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Open Graph</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Open Graph meta tags
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableOpenGraph}
                    onCheckedChange={(checked) => updateSetting('enableOpenGraph', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Twitter Cards</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Twitter Card meta tags
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableTwitterCards}
                    onCheckedChange={(checked) => updateSetting('enableTwitterCards', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
