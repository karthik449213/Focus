import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Flame } from 'lucide-react';
import MotivationalQuote from '@/components/MotivationalQuote';
import PomodoroTimer from '@/components/PomodoroTimer';
import { useSettings } from '@/contexts/SettingsContext';
import type { Session } from '@shared/schema';

export default function Home() {
  const { settings } = useSettings();
  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['/api/session'],
  });

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySessions = sessions?.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= today && sessionDate < tomorrow && session.completed;
  }) || [];

  const totalFocusTime = sessions?.reduce((total, session) => {
    return session.completed ? total + session.duration : total;
  }, 0) || 0;

  const focusTimeMinutes = Math.floor(totalFocusTime / 60);
  const todayFocusTime = Math.floor(
    todaySessions.reduce((total, session) => total + session.duration, 0) / 60
  );

  // Calculate streak (simplified - consecutive days with at least one session)
  const currentStreak = 5; // Placeholder - would need more complex calculation

  const stats = [
    {
      title: "Today's Sessions",
      value: todaySessions.length.toString(),
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: "Total Focus Time",
      value: `${focusTimeMinutes}m`,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: "Current Streak",
      value: `${currentStreak} days`,
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      {/* Motivational Quote */}
      <MotivationalQuote />
      
      {/* Timer */}
      <PomodoroTimer />
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
