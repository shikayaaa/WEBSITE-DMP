import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust path to your firebase config
import { onAuthStateChanged } from 'firebase/auth';
import { Building, CreditCard, Settings, Save, User, Bell, Lock, Globe, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

export function StaffSettings() {
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
const [settings, setSettings] = useState<{
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyWebsite: string;
    businessLicense: string;
    acceptCash: boolean;
    acceptBankTransfer: boolean;
    acceptCheck: boolean;
    acceptCreditCard: boolean;
    paypalEnabled: boolean;
    gcashEnabled: boolean;
    mayaEnabled: boolean;
    currency: string;
    dateFormat: string;
    timeFormat: string;
    timezone: string;
    language: string;
    emailNotifications: boolean;
    paymentReminders: boolean;
    overdueAlerts: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: string;
    passwordExpiry: string;
    theme: string;
    sidebarCollapsed: boolean;
    showQuickActions: boolean;
    [key: string]: any;
  }>({
    
    // Company Information
    companyName: 'Dumaguete Memorial Park',
    companyAddress: '123 Memorial Drive, Dumaguete City, Negros Oriental',
    companyPhone: '+63 35 422 1234',
    companyEmail: 'info@dumaguetememorial.com',
    companyWebsite: 'www.dumaguetememorial.com',
    businessLicense: 'BL-2023-001',
    
    // Payment Gateways
    acceptCash: true,
    acceptBankTransfer: true,
    acceptCheck: true,
    acceptCreditCard: false,
    paypalEnabled: false,
    gcashEnabled: true,
    mayaEnabled: false,
    
    // System Preferences
    currency: 'PHP',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    timezone: 'Asia/Manila',
    language: 'en',
    
    // Notifications
    emailNotifications: true,
    paymentReminders: true,
    overdueAlerts: true,
    systemUpdates: true,
    marketingEmails: false,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    
    // Display
    theme: 'light',
    sidebarCollapsed: false,
    showQuickActions: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  // Apply theme changes
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (settings.theme === 'auto') {
      // Auto theme based on system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);
// Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load settings from Firebase
  useEffect(() => {
    if (!currentUserId) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Load company settings (shared)
        const companyRef = doc(db, 'company_settings', 'config');
        const companySnap = await getDoc(companyRef);
        
        // Load user-specific settings
        const userSettingsRef = doc(db, 'staff_settings', currentUserId);
        const userSettingsSnap = await getDoc(userSettingsRef);

        if (companySnap.exists() || userSettingsSnap.exists()) {
          setSettings(prev => ({
            ...prev,
            ...(companySnap.data() || {}),
            ...(userSettingsSnap.data() || {})
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        alert('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Real-time listener for company settings
    const companyRef = doc(db, 'company_settings', 'config');
    const unsubscribe = onSnapshot(companyRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(prev => ({
          ...prev,
          ...snapshot.data()
        }));
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);
const handleSave = async () => {
    if (!currentUserId) {
      alert('You must be logged in to save settings.');
      return;
    }

    // Basic validation
    if (!settings.companyName.trim()) {
      alert('Company name is required.');
      return;
    }

    if (!settings.companyEmail.trim() || !settings.companyEmail.includes('@')) {
      alert('Valid company email is required.');
      return;
    }

    try {
      setLoading(true); // Show loading state during save

      // Separate company-wide settings from user-specific settings
      const companySettings = {
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        companyPhone: settings.companyPhone,
        companyEmail: settings.companyEmail,
        companyWebsite: settings.companyWebsite,
        businessLicense: settings.businessLicense,
        acceptCash: settings.acceptCash,
        acceptBankTransfer: settings.acceptBankTransfer,
        acceptCheck: settings.acceptCheck,
        acceptCreditCard: settings.acceptCreditCard,
        paypalEnabled: settings.paypalEnabled,
        gcashEnabled: settings.gcashEnabled,
        mayaEnabled: settings.mayaEnabled,
        currency: settings.currency,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserId
      };

      const userSettings = {
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        timezone: settings.timezone,
        language: settings.language,
        emailNotifications: settings.emailNotifications,
        paymentReminders: settings.paymentReminders,
        overdueAlerts: settings.overdueAlerts,
        systemUpdates: settings.systemUpdates,
        marketingEmails: settings.marketingEmails,
        twoFactorAuth: settings.twoFactorAuth,
        sessionTimeout: settings.sessionTimeout,
        passwordExpiry: settings.passwordExpiry,
        theme: settings.theme,
        sidebarCollapsed: settings.sidebarCollapsed,
        showQuickActions: settings.showQuickActions,
        updatedAt: new Date().toISOString()
      };

      // Try to save company settings (might fail if user is not admin/staff)
      try {
        const companyRef = doc(db, 'company_settings', 'config');
        await setDoc(companyRef, companySettings, { merge: true });
      } catch (companyError: any) {
        console.warn('Could not save company settings:', companyError);
        // Continue to save user settings even if company settings fail
        if (companyError.code === 'permission-denied') {
          alert('Note: You do not have permission to update company settings. Only your personal preferences will be saved.');
        }
      }

      // Save user-specific settings (should always work for own settings)
      const userSettingsRef = doc(db, 'staff_settings', currentUserId);
      await setDoc(userSettingsRef, userSettings, { merge: true });

      // Log activity
      try {
        const activityRef = doc(db, 'activityLogs', `${Date.now()}_${currentUserId}`);
        await setDoc(activityRef, {
          userId: currentUserId,
          action: 'settings_updated',
          timestamp: new Date().toISOString(),
          details: 'Staff updated system settings'
        });
      } catch (logError) {
        console.warn('Could not log activity:', logError);
        // Don't fail the entire save operation if logging fails
      }

      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
      if (error.code === 'permission-denied') {
        alert('Permission denied. You may not have the necessary permissions to save these settings. Please contact your administrator.');
      } else if (error.code === 'unavailable') {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert(`Failed to save settings: ${error.message || 'Unknown error'}. Please try again.`);
      }
    } finally {
      setLoading(false); // Always stop loading state
    }
  };
  const paymentGateways = [
    { key: 'acceptCash', label: 'Maya', description: 'Mobile wallet payments via Maya' },
    { key: 'acceptBankTransfer', label: 'Bank Transfer', description: 'Direct bank transfers and deposits' },
    { key: 'gcashEnabled', label: 'GCash', description: 'Mobile wallet payments via GCash' },
  ];

  const notificationSettings = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'paymentReminders', label: 'Payment Reminders', description: 'Send automatic payment reminders to clients' },
    { key: 'overdueAlerts', label: 'Overdue Alerts', description: 'Alert when payments become overdue' },
    { key: 'systemUpdates', label: 'System Updates', description: 'Notifications about system maintenance and updates' },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional and marketing communications' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
    <div>
        <h1 className="text-2xl font-bold">Settings & Configuration</h1>
        <p className="text-muted-foreground">Manage system settings and preferences</p>
        {loading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Saving changes...</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="company" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Settings Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <TabsList className="grid w-full grid-rows-6 h-auto">
                  <TabsTrigger value="company" className="justify-start">
                    <Building className="h-4 w-4 mr-2" />
                    Company
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="display" className="justify-start">
                    <Palette className="h-4 w-4 mr-2" />
                    Display
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            {/* Company Information */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Manage your company details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={settings.companyName}
                        onChange={(e) => handleSettingChange('companyName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessLicense">Business License</Label>
                      <Input
                        id="businessLicense"
                        value={settings.businessLicense}
                        onChange={(e) => handleSettingChange('businessLicense', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Address</Label>
                    <Textarea
                      id="companyAddress"
                      value={settings.companyAddress}
                      onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Phone Number</Label>
                      <Input
                        id="companyPhone"
                        value={settings.companyPhone}
                        onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Email Address</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={settings.companyWebsite}
                      onChange={(e) => handleSettingChange('companyWebsite', e.target.value)}
                    />
                  </div>

              <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Company Information'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Gateways */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Gateways</CardTitle>
                  <CardDescription>
                    Configure accepted payment methods for client transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{gateway.label}</h4>
                            {settings[gateway.key as keyof typeof settings] && (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{gateway.description}</p>
                        </div>
                        <Switch
                          checked={settings[gateway.key as keyof typeof settings] as boolean}
                          onCheckedChange={(checked) => handleSettingChange(gateway.key, checked)}
                        />
                      </div>
                    ))}
                  </div>

      

              <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Payment Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

       
            {/* Notifications */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {notificationSettings.map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{setting.label}</h4>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch
                          checked={settings[setting.key as keyof typeof settings] as boolean}
                          onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                        />
                      </div>
                    ))}
                  </div>

            <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure security and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Select value={settings.passwordExpiry} onValueChange={(value) => handleSettingChange('passwordExpiry', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
<Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Security Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display */}
            <TabsContent value="display">
              <Card>
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                  <CardDescription>
                    Customize the appearance and layout of the interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (System)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">Collapsed Sidebar</h4>
                        <p className="text-sm text-muted-foreground">Start with sidebar collapsed by default</p>
                      </div>
                      <Switch
                        checked={settings.sidebarCollapsed}
                        onCheckedChange={(checked) => handleSettingChange('sidebarCollapsed', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">Show Quick Actions</h4>
                        <p className="text-sm text-muted-foreground">Display quick action buttons in the interface</p>
                      </div>
                      <Switch
                        checked={settings.showQuickActions}
                        onCheckedChange={(checked) => handleSettingChange('showQuickActions', checked)}
                      />
                    </div>
                  </div>

             <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Display Preferences'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}