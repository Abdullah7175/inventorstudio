import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Mail, 
  Calendar,
  Target,
  Users,
  DollarSign,
  Clock,
  Shield,
  Globe,
  Database,
  Download,
  Upload,
  Key,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  Info,
  Plus
} from 'lucide-react';

interface SalesSettings {
  general: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    timezone: string;
    currency: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    leadNotifications: boolean;
    opportunityNotifications: boolean;
    proposalNotifications: boolean;
    followUpReminders: boolean;
    targetAlerts: boolean;
  };
  sales: {
    defaultLeadSource: string;
    defaultPriority: string;
    defaultAssignedTo: string;
    autoAssignLeads: boolean;
    leadScoringEnabled: boolean;
    opportunityStages: string[];
    proposalValidityDays: number;
    followUpReminderDays: number;
  };
  integrations: {
    crmIntegration: boolean;
    emailIntegration: boolean;
    calendarIntegration: boolean;
    phoneIntegration: boolean;
    socialMediaIntegration: boolean;
  };
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    ipWhitelist: string[];
    auditLogging: boolean;
  };
}

export default function SalesSettings() {
  const [settings, setSettings] = useState<SalesSettings>({
    general: {
      companyName: 'Inventor Design Studio',
      companyEmail: 'sales@inventorstudio.com',
      companyPhone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      leadNotifications: true,
      opportunityNotifications: true,
      proposalNotifications: true,
      followUpReminders: true,
      targetAlerts: true
    },
    sales: {
      defaultLeadSource: 'website',
      defaultPriority: 'medium',
      defaultAssignedTo: '',
      autoAssignLeads: false,
      leadScoringEnabled: true,
      opportunityStages: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      proposalValidityDays: 30,
      followUpReminderDays: 7
    },
    integrations: {
      crmIntegration: false,
      emailIntegration: true,
      calendarIntegration: true,
      phoneIntegration: false,
      socialMediaIntegration: false
    },
    security: {
      sessionTimeout: 30,
      requireTwoFactor: false,
      ipWhitelist: [],
      auditLogging: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');

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

  const updateSetting = (section: keyof SalesSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const addIPAddress = () => {
    const ip = prompt('Enter IP address:');
    if (ip && !settings.security.ipWhitelist.includes(ip)) {
      updateSetting('security', 'ipWhitelist', [...settings.security.ipWhitelist, ip]);
    }
  };

  const removeIPAddress = (ip: string) => {
    updateSetting('security', 'ipWhitelist', settings.security.ipWhitelist.filter(i => i !== ip));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sales', label: 'Sales', icon: Target },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Settings</h1>
          <p className="text-muted-foreground">Configure your sales portal settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
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
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
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
                {tabs.find(t => t.id === activeTab)?.icon && (
                  React.createElement(tabs.find(t => t.id === activeTab)!.icon, { className: "h-5 w-5" })
                )}
                <span>{tabs.find(t => t.id === activeTab)?.label} Settings</span>
              </CardTitle>
              <CardDescription>
                Configure your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={settings.general.companyName}
                        onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Company Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={settings.general.companyEmail}
                        onChange={(e) => updateSetting('general', 'companyEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <Input
                        id="companyPhone"
                        value={settings.general.companyPhone}
                        onChange={(e) => updateSetting('general', 'companyPhone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={settings.general.currency} onValueChange={(value) => updateSetting('general', 'currency', value)}>
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
                      <Select value={settings.general.language} onValueChange={(value) => updateSetting('general', 'language', value)}>
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
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications</p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={settings.notifications.pushNotifications}
                          onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="smsNotifications">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={settings.notifications.smsNotifications}
                          onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sales Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="leadNotifications">Lead Notifications</Label>
                          <p className="text-sm text-muted-foreground">Notify when new leads are created</p>
                        </div>
                        <Switch
                          id="leadNotifications"
                          checked={settings.notifications.leadNotifications}
                          onCheckedChange={(checked) => updateSetting('notifications', 'leadNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="opportunityNotifications">Opportunity Notifications</Label>
                          <p className="text-sm text-muted-foreground">Notify when opportunities are updated</p>
                        </div>
                        <Switch
                          id="opportunityNotifications"
                          checked={settings.notifications.opportunityNotifications}
                          onCheckedChange={(checked) => updateSetting('notifications', 'opportunityNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="proposalNotifications">Proposal Notifications</Label>
                          <p className="text-sm text-muted-foreground">Notify when proposals are sent or responded to</p>
                        </div>
                        <Switch
                          id="proposalNotifications"
                          checked={settings.notifications.proposalNotifications}
                          onCheckedChange={(checked) => updateSetting('notifications', 'proposalNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="followUpReminders">Follow-up Reminders</Label>
                          <p className="text-sm text-muted-foreground">Remind about scheduled follow-ups</p>
                        </div>
                        <Switch
                          id="followUpReminders"
                          checked={settings.notifications.followUpReminders}
                          onCheckedChange={(checked) => updateSetting('notifications', 'followUpReminders', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="targetAlerts">Target Alerts</Label>
                          <p className="text-sm text-muted-foreground">Alert when targets are at risk</p>
                        </div>
                        <Switch
                          id="targetAlerts"
                          checked={settings.notifications.targetAlerts}
                          onCheckedChange={(checked) => updateSetting('notifications', 'targetAlerts', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="defaultLeadSource">Default Lead Source</Label>
                      <Select value={settings.sales.defaultLeadSource} onValueChange={(value) => updateSetting('sales', 'defaultLeadSource', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="cold_call">Cold Call</SelectItem>
                          <SelectItem value="email_campaign">Email Campaign</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultPriority">Default Priority</Label>
                      <Select value={settings.sales.defaultPriority} onValueChange={(value) => updateSetting('sales', 'defaultPriority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultAssignedTo">Default Assigned To</Label>
                    <Input
                      id="defaultAssignedTo"
                      value={settings.sales.defaultAssignedTo}
                      onChange={(e) => updateSetting('sales', 'defaultAssignedTo', e.target.value)}
                      placeholder="Sales Representative"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sales Automation</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoAssignLeads">Auto-assign Leads</Label>
                          <p className="text-sm text-muted-foreground">Automatically assign leads to team members</p>
                        </div>
                        <Switch
                          id="autoAssignLeads"
                          checked={settings.sales.autoAssignLeads}
                          onCheckedChange={(checked) => updateSetting('sales', 'autoAssignLeads', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="leadScoringEnabled">Lead Scoring</Label>
                          <p className="text-sm text-muted-foreground">Enable automatic lead scoring</p>
                        </div>
                        <Switch
                          id="leadScoringEnabled"
                          checked={settings.sales.leadScoringEnabled}
                          onCheckedChange={(checked) => updateSetting('sales', 'leadScoringEnabled', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="proposalValidityDays">Proposal Validity (Days)</Label>
                      <Input
                        id="proposalValidityDays"
                        type="number"
                        value={settings.sales.proposalValidityDays}
                        onChange={(e) => updateSetting('sales', 'proposalValidityDays', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="followUpReminderDays">Follow-up Reminder (Days)</Label>
                      <Input
                        id="followUpReminderDays"
                        type="number"
                        value={settings.sales.followUpReminderDays}
                        onChange={(e) => updateSetting('sales', 'followUpReminderDays', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Third-party Integrations</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="crmIntegration">CRM Integration</Label>
                          <p className="text-sm text-muted-foreground">Connect with external CRM systems</p>
                        </div>
                        <Switch
                          id="crmIntegration"
                          checked={settings.integrations.crmIntegration}
                          onCheckedChange={(checked) => updateSetting('integrations', 'crmIntegration', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailIntegration">Email Integration</Label>
                          <p className="text-sm text-muted-foreground">Sync with email providers</p>
                        </div>
                        <Switch
                          id="emailIntegration"
                          checked={settings.integrations.emailIntegration}
                          onCheckedChange={(checked) => updateSetting('integrations', 'emailIntegration', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="calendarIntegration">Calendar Integration</Label>
                          <p className="text-sm text-muted-foreground">Sync with calendar applications</p>
                        </div>
                        <Switch
                          id="calendarIntegration"
                          checked={settings.integrations.calendarIntegration}
                          onCheckedChange={(checked) => updateSetting('integrations', 'calendarIntegration', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="phoneIntegration">Phone Integration</Label>
                          <p className="text-sm text-muted-foreground">Connect with phone systems</p>
                        </div>
                        <Switch
                          id="phoneIntegration"
                          checked={settings.integrations.phoneIntegration}
                          onCheckedChange={(checked) => updateSetting('integrations', 'phoneIntegration', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="socialMediaIntegration">Social Media Integration</Label>
                          <p className="text-sm text-muted-foreground">Connect with social media platforms</p>
                        </div>
                        <Switch
                          id="socialMediaIntegration"
                          checked={settings.integrations.socialMediaIntegration}
                          onCheckedChange={(checked) => updateSetting('integrations', 'socialMediaIntegration', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="requireTwoFactor">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                        </div>
                        <Switch
                          id="requireTwoFactor"
                          checked={settings.security.requireTwoFactor}
                          onCheckedChange={(checked) => updateSetting('security', 'requireTwoFactor', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auditLogging">Audit Logging</Label>
                          <p className="text-sm text-muted-foreground">Log all user activities</p>
                        </div>
                        <Switch
                          id="auditLogging"
                          checked={settings.security.auditLogging}
                          onCheckedChange={(checked) => updateSetting('security', 'auditLogging', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>IP Whitelist</Label>
                      <Button variant="outline" size="sm" onClick={addIPAddress}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add IP
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {settings.security.ipWhitelist.map((ip) => (
                        <div key={ip} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{ip}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIPAddress(ip)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      {settings.security.ipWhitelist.length === 0 && (
                        <p className="text-sm text-muted-foreground">No IP addresses whitelisted</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
