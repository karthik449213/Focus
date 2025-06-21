import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Download, Trash2, Save, Sun, Moon, Monitor } from 'lucide-react';
import type { InsertSettings } from '@shared/schema';

export default function Settings() {
  const { settings, updateSettings, isLoading } = useSettings();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertSettings>>({});

  // Initialize form data when settings load
  useState(() => {
    if (settings && Object.keys(formData).length === 0) {
      setFormData({
        focusDuration: settings.focusDuration,
        shortBreakDuration: settings.shortBreakDuration,
        longBreakDuration: settings.longBreakDuration,
        dailyGoal: settings.dailyGoal,
        soundNotifications: settings.soundNotifications,
        browserNotifications: settings.browserNotifications,
      });
    }
  });

  const handleInputChange = (key: keyof InsertSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} theme.`,
    });
  };

  const handleExportData = () => {
    const exportData = {
      settings: settings,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focushero-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your settings have been exported successfully.",
    });
  };

  const handleClearData = () => {
    localStorage.clear();
    toast({
      title: "Data cleared",
      description: "All local data has been cleared. The page will refresh.",
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleInputChange('browserNotifications', true);
        toast({
          title: "Notifications enabled",
          description: "You'll now receive browser notifications.",
        });
      } else {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    }
  };

  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds / 60)} minutes`;
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load settings. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Customize your focus experience
        </p>
      </div>

      {/* Timer Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Timer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus-duration">Focus Session Duration</Label>
            <Select
              value={(formData.focusDuration || settings.focusDuration).toString()}
              onValueChange={(value) => handleInputChange('focusDuration', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="900">15 minutes</SelectItem>
                <SelectItem value="1500">25 minutes (Default)</SelectItem>
                <SelectItem value="1800">30 minutes</SelectItem>
                <SelectItem value="2700">45 minutes</SelectItem>
                <SelectItem value="3000">50 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short-break">Short Break Duration</Label>
            <Select
              value={(formData.shortBreakDuration || settings.shortBreakDuration).toString()}
              onValueChange={(value) => handleInputChange('shortBreakDuration', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="600">10 minutes</SelectItem>
                <SelectItem value="900">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="long-break">Long Break Duration</Label>
            <Select
              value={(formData.longBreakDuration || settings.longBreakDuration).toString()}
              onValueChange={(value) => handleInputChange('longBreakDuration', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="900">15 minutes</SelectItem>
                <SelectItem value="1200">20 minutes</SelectItem>
                <SelectItem value="1800">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Goals & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily-goal">Daily Session Goal</Label>
            <Input
              id="daily-goal"
              type="number"
              min="1"
              max="20"
              value={formData.dailyGoal || settings.dailyGoal}
              onChange={(e) => handleInputChange('dailyGoal', parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Play sound when sessions start/end
              </p>
            </div>
            <Switch
              checked={formData.soundNotifications ?? settings.soundNotifications}
              onCheckedChange={(checked) => handleInputChange('soundNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show desktop notifications
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!('Notification' in window) ? (
                <span className="text-sm text-muted-foreground">Not supported</span>
              ) : Notification.permission === 'denied' ? (
                <span className="text-sm text-destructive">Permission denied</span>
              ) : (
                <Switch
                  checked={formData.browserNotifications ?? settings.browserNotifications}
                  onCheckedChange={(checked) => {
                    if (checked && Notification.permission === 'default') {
                      requestNotificationPermission();
                    } else {
                      handleInputChange('browserNotifications', checked);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Sun className="h-4 w-4" />
                <span className="text-xs">Light</span>
              </Button>
              
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Moon className="h-4 w-4" />
                <span className="text-xs">Dark</span>
              </Button>
              
              <Button
                variant={theme === 'auto' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('auto')}
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Monitor className="h-4 w-4" />
                <span className="text-xs">Auto</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleExportData}
            className="w-full"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Session Data
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your
                  focus sessions, settings, and local data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="min-w-24">
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
