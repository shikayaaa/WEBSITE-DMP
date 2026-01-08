import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Palette, Database, Activity, Search, Calendar, User, Edit, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';
import { 
  type Settings, 
  type ActivityLog, 
  fetchSettings, 
  updateSettings, 
  fetchActivityLogs,
  triggerManualBackup 
} from '../../firebase.service';

// ...// ← Goes from src/components/admin/ to src/
export function SettingsPage() {
  // State management
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Form state for general settings
  const [generalForm, setGeneralForm] = useState({
    parkName: '',
    contactEmail: '',
    phone: '',
    timezone: 'asia-manila',
    address: '',
    officeHours: '',
    serviceHours: ''
  });

  // Form state for notifications
  const [notificationsForm, setNotificationsForm] = useState({
    emailPaymentReminders: true,
    emailIntermentConfirmations: true,
    emailNewClientRegistration: true,
    systemDailyReports: true,
    systemMaintenance: true,
    systemLowInventory: false,
    reminderDays: 7
  });

  // Form state for security
  const [securityForm, setSecurityForm] = useState({
    minLength: 8,
    expiryDays: 90,
    requireSpecialChars: true,
    requireNumbers: true,
    require2FA: false,
    timeoutMinutes: 30,
    maxLoginAttempts: 5
  });

  // Form state for system
  const [systemForm, setSystemForm] = useState({
    automaticBackups: true,
    dataRetention: true,
    backupTime: '02:00',
    maintenanceMode: false,
    debugMode: false
  });

  // Load settings and activity logs on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload activity logs when filter changes
  useEffect(() => {
    loadActivityLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSettings(),
        loadActivityLogs()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
const loadSettings = async () => {
    try {
      const fetchedSettings = await fetchSettings();
      if (fetchedSettings) {
        setSettings(fetchedSettings);
        
        // Populate form states with safe defaults
        setGeneralForm({
          parkName: fetchedSettings.general?.parkName || '',
          contactEmail: fetchedSettings.general?.contactEmail || '',
          phone: fetchedSettings.general?.phone || '',
          timezone: fetchedSettings.general?.timezone || 'asia-manila',
          address: fetchedSettings.general?.address || '',
          officeHours: fetchedSettings.general?.officeHours || '',
          serviceHours: fetchedSettings.general?.serviceHours || ''
        });

        setNotificationsForm({
          emailPaymentReminders: fetchedSettings.notifications?.email?.paymentReminders ?? true,
          emailIntermentConfirmations: fetchedSettings.notifications?.email?.intermentConfirmations ?? true,
          emailNewClientRegistration: fetchedSettings.notifications?.email?.newClientRegistration ?? true,
          systemDailyReports: fetchedSettings.notifications?.system?.dailyReports ?? true,
          systemMaintenance: fetchedSettings.notifications?.system?.systemMaintenance ?? true,
          systemLowInventory: fetchedSettings.notifications?.system?.lowInventory ?? false,
          reminderDays: fetchedSettings.notifications?.reminderDays ?? 7
        });

        setSecurityForm({
          minLength: fetchedSettings.security?.passwordPolicy?.minLength ?? 8,
          expiryDays: fetchedSettings.security?.passwordPolicy?.expiryDays ?? 90,
          requireSpecialChars: fetchedSettings.security?.passwordPolicy?.requireSpecialChars ?? true,
          requireNumbers: fetchedSettings.security?.passwordPolicy?.requireNumbers ?? true,
          require2FA: fetchedSettings.security?.passwordPolicy?.require2FA ?? false,
          timeoutMinutes: fetchedSettings.security?.session?.timeoutMinutes ?? 30,
          maxLoginAttempts: fetchedSettings.security?.session?.maxLoginAttempts ?? 5
        });

        setSystemForm({
          automaticBackups: fetchedSettings.system?.database?.automaticBackups ?? true,
          dataRetention: fetchedSettings.system?.database?.dataRetention ?? true,
          backupTime: fetchedSettings.system?.database?.backupTime ?? '02:00',
          maintenanceMode: fetchedSettings.system?.maintenance?.maintenanceMode ?? false,
          debugMode: fetchedSettings.system?.maintenance?.debugMode ?? false
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  };

  const loadActivityLogs = async () => {
    try {
      const logs = await fetchActivityLogs({
        type: actionFilter !== 'all' ? actionFilter : undefined,
        limit: 100
      });
      setActivityLogs(logs);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Failed to load activity logs');
    }
  };

  const handleSaveGeneral = async () => {
    try {
      await updateSettings({
        general: {
          parkName: generalForm.parkName,
          contactEmail: generalForm.contactEmail,
          phone: generalForm.phone,
          timezone: generalForm.timezone,
          address: generalForm.address,
          officeHours: generalForm.officeHours,
          serviceHours: generalForm.serviceHours
        }
      });
      toast.success('General settings saved successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save general settings');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateSettings({
        notifications: {
          email: {
            paymentReminders: notificationsForm.emailPaymentReminders,
            intermentConfirmations: notificationsForm.emailIntermentConfirmations,
            newClientRegistration: notificationsForm.emailNewClientRegistration
          },
          system: {
            dailyReports: notificationsForm.systemDailyReports,
            systemMaintenance: notificationsForm.systemMaintenance,
            lowInventory: notificationsForm.systemLowInventory
          },
          reminderDays: notificationsForm.reminderDays
        }
      });
      toast.success('Notification settings saved successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await updateSettings({
        security: {
          passwordPolicy: {
            minLength: securityForm.minLength,
            expiryDays: securityForm.expiryDays,
            requireSpecialChars: securityForm.requireSpecialChars,
            requireNumbers: securityForm.requireNumbers,
            require2FA: securityForm.require2FA
          },
          session: {
            timeoutMinutes: securityForm.timeoutMinutes,
            maxLoginAttempts: securityForm.maxLoginAttempts
          }
        }
      });
      toast.success('Security settings updated successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    }
  };

  const handleSaveSystem = async () => {
    try {
      await updateSettings({
        system: {
          ...settings?.system,
          database: {
            automaticBackups: systemForm.automaticBackups,
            dataRetention: systemForm.dataRetention,
            backupTime: systemForm.backupTime
          },
          maintenance: {
            maintenanceMode: systemForm.maintenanceMode,
            debugMode: systemForm.debugMode
          }
        }
      });
      toast.success('System settings saved successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast.error('Failed to save system settings');
    }
  };

  const handleManualBackup = async () => {
    try {
      await triggerManualBackup();
      toast.success('Manual backup initiated successfully');
      await loadActivityLogs();
    } catch (error) {
      console.error('Error initiating backup:', error);
      toast.error('Failed to initiate backup');
    }
  };
const filteredLogs = activityLogs.filter(log => {
  const matchesSearch = (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
  return matchesSearch;
});
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'payment': return <FileText className="h-4 w-4 text-green-600" />;
      case 'contract': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'interment': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'client': return <User className="h-4 w-4 text-yellow-600" />;
      case 'lot': return <Edit className="h-4 w-4 text-orange-600" />;
      case 'user': return <User className="h-4 w-4 text-indigo-600" />;
      case 'system': return <Database className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'interment': return 'bg-purple-100 text-purple-800';
      case 'client': return 'bg-yellow-100 text-yellow-800';
      case 'lot': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-indigo-100 text-indigo-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Timestamp | any) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return 'Invalid date';
  }
};
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage system configuration and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="park-name">Memorial Park Name</Label>
                  <Input 
                    id="park-name" 
                    value={generalForm.parkName}
                    onChange={(e) => setGeneralForm({ ...generalForm, parkName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input 
                    id="contact-email" 
                    type="email" 
                    value={generalForm.contactEmail}
                    onChange={(e) => setGeneralForm({ ...generalForm, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input 
                    id="phone" 
                    value={generalForm.phone}
                    onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={generalForm.timezone}
                    onValueChange={(value) => setGeneralForm({ ...generalForm, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-manila">Asia/Manila</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Business Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="office-hours">Office Hours</Label>
                    <Input 
                      id="office-hours" 
                      value={generalForm.officeHours}
                      onChange={(e) => setGeneralForm({ ...generalForm, officeHours: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-hours">Service Hours</Label>
                    <Input 
                      id="service-hours" 
                      value={generalForm.serviceHours}
                      onChange={(e) => setGeneralForm({ ...generalForm, serviceHours: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveGeneral}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Reminders</p>
                      <p className="text-sm text-muted-foreground">Send automatic payment reminder emails</p>
                    </div>
                    <Switch 
                      checked={notificationsForm.emailPaymentReminders}
                      onCheckedChange={(checked) => setNotificationsForm({ ...notificationsForm, emailPaymentReminders: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Interment Confirmations</p>
                      <p className="text-sm text-muted-foreground">Send confirmation emails for scheduled services</p>
                    </div>
                    <Switch 
                      checked={notificationsForm.emailIntermentConfirmations}
                      onCheckedChange={(checked) => setNotificationsForm({ ...notificationsForm, emailIntermentConfirmations: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Client Registration</p>
                      <p className="text-sm text-muted-foreground">Notify admin of new client registrations</p>
                    </div>
                    <Switch 
                      checked={notificationsForm.emailNewClientRegistration}
                      onCheckedChange={(checked) => setNotificationsForm({ ...notificationsForm, emailNewClientRegistration: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">System Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Reports</p>
                      <p className="text-sm text-muted-foreground">Receive daily operational reports</p>
                    </div>
                    <Switch 
                      checked={notificationsForm.systemDailyReports}
                      onCheckedChange={(checked) => setNotificationsForm({ ...notificationsForm, systemDailyReports: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Maintenance</p>
                      <p className="text-sm text-muted-foreground">Alerts for system maintenance and updates</p>
                    </div>
                    <Switch 
                      checked={notificationsForm.systemMaintenance}
                      onCheckedChange={(checked) => setNotificationsForm({ ...notificationsForm, systemMaintenance: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Low Inventory</p>
                      <p className="text-sm text-muted-foreground">Alert when lot availability is low</p>
                    </div>
                    <Switch 
                      checked={notificationsForm.systemLowInventory}
                      onCheckedChange={(checked) => setNotificationsForm({ ...notificationsForm, systemLowInventory: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-days">Payment Reminder (days before due)</Label>
                <Select 
                  value={String(notificationsForm.reminderDays)}
                  onValueChange={(value) => setNotificationsForm({ ...notificationsForm, reminderDays: parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveNotifications}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-length">Minimum Password Length</Label>
                    <Select 
                      value={String(securityForm.minLength)}
                      onValueChange={(value) => setSecurityForm({ ...securityForm, minLength: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Select 
                      value={String(securityForm.expiryDays)}
                      onValueChange={(value) => setSecurityForm({ ...securityForm, expiryDays: value === 'never' ? 0 : parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Special Characters</p>
                      <p className="text-sm text-muted-foreground">Password must contain special characters</p>
                    </div>
                    <Switch 
                      checked={securityForm.requireSpecialChars}
                      onCheckedChange={(checked) => setSecurityForm({ ...securityForm, requireSpecialChars: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Numbers</p>
                      <p className="text-sm text-muted-foreground">Password must contain numbers</p>
                    </div>
                    <Switch 
                      checked={securityForm.requireNumbers}
                      onCheckedChange={(checked) => setSecurityForm({ ...securityForm, requireNumbers: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch 
                      checked={securityForm.require2FA}
                      onCheckedChange={(checked) => setSecurityForm({ ...securityForm, require2FA: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Session Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Select 
                      value={String(securityForm.timeoutMinutes)}
                      onValueChange={(value) => setSecurityForm({ ...securityForm, timeoutMinutes: parseInt(value) })}
                    >
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
                    <Label htmlFor="max-attempts">Max Login Attempts</Label>
                    <Select 
                      value={String(securityForm.maxLoginAttempts)}
                      onValueChange={(value) => setSecurityForm({ ...securityForm, maxLoginAttempts: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveSecurity}>
                <Save className="h-4 w-4 mr-2" />
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Database</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatic Backups</p>
                      <p className="text-sm text-muted-foreground">Daily automated database backups</p>
                    </div>
                    <Switch 
                      checked={systemForm.automaticBackups}
                      onCheckedChange={(checked) => setSystemForm({ ...systemForm, automaticBackups: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Retention</p>
                      <p className="text-sm text-muted-foreground">Keep logs for compliance</p>
                    </div>
                    <Switch 
                      checked={systemForm.dataRetention}
                      onCheckedChange={(checked) => setSystemForm({ ...systemForm, dataRetention: checked })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-time">Backup Time</Label>
                  <Input 
                    id="backup-time" 
                    type="time" 
                    value={systemForm.backupTime}
                    onChange={(e) => setSystemForm({ ...systemForm, backupTime: e.target.value })}
                    className="w-32" 
                  />
                </div>
                <Button variant="outline" onClick={handleManualBackup}>Run Manual Backup</Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">System Maintenance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode for updates</p>
                    </div>
                    <Switch 
                      checked={systemForm.maintenanceMode}
                      onCheckedChange={(checked) => setSystemForm({ ...systemForm, maintenanceMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Debug Mode</p>
                      <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
                    </div>
                    <Switch 
                      checked={systemForm.debugMode}
                      onCheckedChange={(checked) => setSystemForm({ ...systemForm, debugMode: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
  <div>
    <p className="text-muted-foreground">Version:</p>
    <p className="font-medium">{settings?.system?.info?.version || 'N/A'}</p>
  </div>
  <div>
    <p className="text-muted-foreground">Last Updated:</p>
    <p className="font-medium">{settings?.system?.info?.lastUpdated || 'N/A'}</p>
  </div>
  <div>
    <p className="text-muted-foreground">Database Size:</p>
    <p className="font-medium">{settings?.system?.info?.databaseSize || 'N/A'}</p>
  </div>
  <div>
    <p className="text-muted-foreground">Active Users:</p>
    <p className="font-medium">{settings?.system?.info?.activeUsers || 0}</p>
  </div>
</div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveSystem}>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all user actions and system activities
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="interment">Interment</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="lot">Lot</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.user}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.type)}
                              {log.action}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={log.details}>
                            {log.details}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                        <TableCell>
  <Badge className={getActionColor(log.type || 'system')}>
    {log.type ? (log.type.charAt(0).toUpperCase() + log.type.slice(1)) : 'System'}
  </Badge>
</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Activity Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {activityLogs.filter(log => log.type === 'payment').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Payment Actions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {activityLogs.filter(log => log.type === 'contract').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Contract Actions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {activityLogs.filter(log => log.type === 'interment').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Interment Actions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {activityLogs.filter(log => log.type === 'system').length}
                    </p>
                    <p className="text-sm text-muted-foreground">System Actions</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}