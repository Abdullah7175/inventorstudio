import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Clock,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    skills: string[];
    bio: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
    teamMessages: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    dashboardLayout: 'compact' | 'spacious';
    defaultView: 'dashboard' | 'projects' | 'calendar';
    autoSave: boolean;
    showTutorials: boolean;
    enableKeyboardShortcuts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    dataExportEnabled: boolean;
  };
}

export default function TeamSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      skills: [],
      bio: '',
      timezone: 'UTC',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      projectUpdates: true,
      deadlineReminders: true,
      teamMessages: true,
      systemAlerts: true,
      weeklyReports: false
    },
    preferences: {
      theme: 'system',
      dashboardLayout: 'spacious',
      defaultView: 'dashboard',
      autoSave: true,
      showTutorials: true,
      enableKeyboardShortcuts: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginNotifications: true,
      dataExportEnabled: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockSettings: UserSettings = {
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@team.inventorstudio.com',
        phone: '+1 (555) 123-4567',
        department: 'Development',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        bio: 'Full-stack developer with 5+ years of experience in web development.',
        timezone: 'America/New_York',
        language: 'en'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        projectUpdates: true,
        deadlineReminders: true,
        teamMessages: true,
        systemAlerts: true,
        weeklyReports: false
      },
      preferences: {
        theme: 'system',
        dashboardLayout: 'spacious',
        defaultView: 'dashboard',
        autoSave: true,
        showTutorials: true,
        enableKeyboardShortcuts: true
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginNotifications: true,
        dataExportEnabled: true
      }
    };

    setSettings(mockSettings);
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !settings.profile.skills.includes(newSkill.trim())) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter(s => s !== skill)
      }
    }));
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={settings.profile.firstName}
                  onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={settings.profile.lastName}
                  onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={settings.profile.phone}
                  onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={settings.profile.department}
                  onChange={(e) => updateSetting('profile', 'department', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={settings.profile.timezone}
                  onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={settings.profile.bio}
                onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {settings.profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Login</span>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Member Since</span>
                <span className="text-sm text-muted-foreground">Jan 2024</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified about updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Project Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about project changes</p>
                </div>
                <Switch
                  checked={settings.notifications.projectUpdates}
                  onCheckedChange={(checked) => updateSetting('notifications', 'projectUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Deadline Reminders</Label>
                  <p className="text-sm text-muted-foreground">Reminders for upcoming deadlines</p>
                </div>
                <Switch
                  checked={settings.notifications.deadlineReminders}
                  onCheckedChange={(checked) => updateSetting('notifications', 'deadlineReminders', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Team Messages</Label>
                  <p className="text-sm text-muted-foreground">Notifications for team messages</p>
                </div>
                <Switch
                  checked={settings.notifications.teamMessages}
                  onCheckedChange={(checked) => updateSetting('notifications', 'teamMessages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Important system notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={settings.preferences.theme}
                  onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Dashboard Layout</Label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={settings.preferences.dashboardLayout}
                  onChange={(e) => updateSetting('preferences', 'dashboardLayout', e.target.value)}
                >
                  <option value="compact">Compact</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Default View</Label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={settings.preferences.defaultView}
                  onChange={(e) => updateSetting('preferences', 'defaultView', e.target.value)}
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="projects">Projects</option>
                  <option value="calendar">Calendar</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch
                  checked={settings.preferences.autoSave}
                  onCheckedChange={(checked) => updateSetting('preferences', 'autoSave', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Tutorials</Label>
                  <p className="text-sm text-muted-foreground">Display helpful tutorials</p>
                </div>
                <Switch
                  checked={settings.preferences.showTutorials}
                  onCheckedChange={(checked) => updateSetting('preferences', 'showTutorials', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Keyboard Shortcuts</Label>
                  <p className="text-sm text-muted-foreground">Enable keyboard shortcuts</p>
                </div>
                <Switch
                  checked={settings.preferences.enableKeyboardShortcuts}
                  onCheckedChange={(checked) => updateSetting('preferences', 'enableKeyboardShortcuts', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                </div>
                <Switch
                  checked={settings.security.loginNotifications}
                  onCheckedChange={(checked) => updateSetting('security', 'loginNotifications', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  min="5"
                  max="480"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Export</Label>
                  <p className="text-sm text-muted-foreground">Allow exporting your data</p>
                </div>
                <Switch
                  checked={settings.security.dataExportEnabled}
                  onCheckedChange={(checked) => updateSetting('security', 'dataExportEnabled', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
