import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useQuery } from '@tanstack/react-query';
import { 
  Timer, 
  History, 
  Settings, 
  Menu, 
  Sun, 
  Moon, 
  Brain,
  Clock,
  Target,
  Flame
} from 'lucide-react';
import type { Session } from '@shared/schema';

const navigation = [
  { name: 'Focus Timer', href: '/', icon: Timer },
  { name: 'Session History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme, isDark } = useTheme();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['/api/session'],
  });

  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySessions = sessions?.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= today && sessionDate < tomorrow && session.completed;
  }) || [];

  const todayFocusTime = todaySessions.reduce((total, session) => total + session.duration, 0);
  const focusTimeMinutes = Math.floor(todayFocusTime / 60);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    return <div className="h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-blue-600" />;
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-6' : 'p-4'}`}>
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold">FocusHero</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setMobileMenuOpen(false)}
            >
              <div
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Today's Progress */}
      {!mobile && (
        <div className="focus-card p-4 bg-muted/50">
          <h3 className="text-sm font-medium mb-3">Today's Progress</h3>
          
          <div className="space-y-3">
            {/* Sessions Progress */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Sessions</span>
                <span>{todaySessions.length} of {settings?.dailyGoal || 4}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (todaySessions.length / (settings?.dailyGoal || 4)) * 100)}%` 
                  }}
                />
              </div>
            </div>
            
            {/* Focus Time */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Focus Time</span>
                <span>{focusTimeMinutes}m</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (focusTimeMinutes / 120) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FocusHero</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {getThemeIcon()}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 bg-card border-r border-border fixed left-0 top-0 bottom-0 overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-72 pt-16 md:pt-0 pb-16 md:pb-0">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 3).map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex flex-col items-center py-2 px-4 transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats Cards for Desktop Header */}
      <div className="hidden md:block fixed top-4 right-4 z-40">
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {getThemeIcon()}
          </Button>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-3 bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center space-x-1 text-sm">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">{todaySessions.length}/{settings?.dailyGoal || 4}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">{focusTimeMinutes}m</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
