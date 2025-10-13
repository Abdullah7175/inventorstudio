import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Globe, 
  Mail, 
  Bell, 
  Database,
  Key,
  Users,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Basic application configuration',
    icon: Settings
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Authentication and security settings',
    icon: Shield
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Email and push notification settings',
    icon: Bell
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Third-party service integrations',
    icon: Globe
  },
  {
    id: 'backup',
    title: 'Backup & Recovery',
    description: 'Data backup and recovery settings',
    icon: Database
  }
];

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState<string>('general');
  const [isLoading, setIsLoading] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Inventor Design Studio',
    companyEmail: 'admin@inventorstudio.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: 'First Floor, Plaza No. 8, H, A4, Commercial Area Block H Valencia, Lahore, 54000',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    twoFactorEnabled: false,
    ipWhitelistEnabled: false,
    ipWhitelist: '',
    apiRateLimit: 1000,
    logRetentionDays: 90
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    adminNotifications: true,
    customerNotifications: true,
    systemAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
    monthlyReports: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@inventorstudio.com',
    fromName: 'Inventor Design Studio'
  });

  // Integration Settings State
  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalytics: false,
    googleAnalyticsId: '',
    facebookPixel: false,
    facebookPixelId: '',
    stripeEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    slackEnabled: false,
    slackWebhookUrl: '',
    githubEnabled: false,
    githubToken: '',
    awsEnabled: false,
    awsAccessKey: '',
    awsSecretKey: '',
    awsRegion: 'us-east-1'
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Settings saved successfully');
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    console.log('Settings reset to defaults');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={generalSettings.companyName}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyEmail">Company Email</Label>
          <Input
            id="companyEmail"
            type="email"
            value={generalSettings.companyEmail}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyPhone">Company Phone</Label>
          <Input
            id="companyPhone"
            value={generalSettings.companyPhone}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyAddress">Company Address</Label>
        <Textarea
          id="companyAddress"
          value={generalSettings.companyAddress}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">Enable maintenance mode to prevent user access</p>
          </div>
          <Switch
            id="maintenanceMode"
            checked={generalSettings.maintenanceMode}
            onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="registrationEnabled">User Registration</Label>
            <p className="text-sm text-muted-foreground">Allow new users to register</p>
          </div>
          <Switch
            id="registrationEnabled"
            checked={generalSettings.registrationEnabled}
            onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, registrationEnabled: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="emailVerificationRequired">Email Verification</Label>
            <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
          </div>
          <Switch
            id="emailVerificationRequired"
            checked={generalSettings.emailVerificationRequired}
            onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, emailVerificationRequired: checked }))}
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
          <Input
            id="maxLoginAttempts"
            type="number"
            value={securitySettings.maxLoginAttempts}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Password Requirements</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">Minimum Length</Label>
            <Input
              id="passwordMinLength"
              type="number"
              value={securitySettings.passwordMinLength}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
              <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
            </div>
            <Switch
              id="requireSpecialChars"
              checked={securitySettings.requireSpecialChars}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireNumbers">Require Numbers</Label>
              <p className="text-sm text-muted-foreground">Passwords must contain numbers</p>
            </div>
            <Switch
              id="requireNumbers"
              checked={securitySettings.requireNumbers}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireNumbers: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
              <p className="text-sm text-muted-foreground">Passwords must contain uppercase letters</p>
            </div>
            <Switch
              id="requireUppercase"
              checked={securitySettings.requireUppercase}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireUppercase: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
            </div>
            <Switch
              id="twoFactorEnabled"
              checked={securitySettings.twoFactorEnabled}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="ipWhitelistEnabled">IP Whitelist</Label>
            <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
          </div>
          <Switch
            id="ipWhitelistEnabled"
            checked={securitySettings.ipWhitelistEnabled}
            onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, ipWhitelistEnabled: checked }))}
          />
        </div>

        {securitySettings.ipWhitelistEnabled && (
          <div className="space-y-2">
            <Label htmlFor="ipWhitelist">IP Addresses (one per line)</Label>
            <Textarea
              id="ipWhitelist"
              value={securitySettings.ipWhitelist}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
              placeholder="192.168.1.1&#10;10.0.0.1&#10;..."
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Types</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Send push notifications to mobile devices</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={notificationSettings.pushNotifications}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={notificationSettings.smsNotifications}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
            />
          </div>
        </div>
      </div>

      {notificationSettings.emailNotifications && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">SMTP Configuration</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={notificationSettings.smtpHost}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={notificationSettings.smtpPort}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input
                id="smtpUsername"
                value={notificationSettings.smtpUsername}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={notificationSettings.smtpPassword}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={notificationSettings.fromEmail}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={notificationSettings.fromName}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, fromName: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="googleAnalytics">Google Analytics</Label>
                <p className="text-sm text-muted-foreground">Track website analytics</p>
              </div>
              <Switch
                id="googleAnalytics"
                checked={integrationSettings.googleAnalytics}
                onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, googleAnalytics: checked }))}
              />
            </div>
            {integrationSettings.googleAnalytics && (
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={integrationSettings.googleAnalyticsId}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                  placeholder="GA-XXXXXXXXX"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Payment Processing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="stripeEnabled">Stripe</Label>
                <p className="text-sm text-muted-foreground">Enable Stripe payment processing</p>
              </div>
              <Switch
                id="stripeEnabled"
                checked={integrationSettings.stripeEnabled}
                onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, stripeEnabled: checked }))}
              />
            </div>
            {integrationSettings.stripeEnabled && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                  <Input
                    id="stripePublicKey"
                    value={integrationSettings.stripePublicKey}
                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                    placeholder="pk_test_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    value={integrationSettings.stripeSecretKey}
                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                    placeholder="sk_test_..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup Configuration</CardTitle>
            <CardDescription>Configure automatic backups and recovery options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Backup & Recovery</h3>
              <p className="text-muted-foreground mb-4">
                Configure automatic backups, recovery options, and data export settings.
              </p>
              <div className="flex justify-center space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'integrations':
        return renderIntegrationSettings();
      case 'backup':
        return renderBackupSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs opacity-70">{section.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {settingsSections.find(s => s.id === activeSection)?.icon && (
                  React.createElement(settingsSections.find(s => s.id === activeSection)!.icon, { className: "h-5 w-5" })
                )}
                <span>{settingsSections.find(s => s.id === activeSection)?.title}</span>
              </CardTitle>
              <CardDescription>
                {settingsSections.find(s => s.id === activeSection)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSettingsContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
