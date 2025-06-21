import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '@shared/schema';

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const formatTime = (date: Date | string): string => {
    const sessionDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
    
    if (sessionDay.getTime() === today.getTime()) {
      return `Today, ${format(sessionDate, 'h:mm a')}`;
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (sessionDay.getTime() === yesterday.getTime()) {
        return `Yesterday, ${format(sessionDate, 'h:mm a')}`;
      } else {
        return format(sessionDate, 'MMM d, h:mm a');
      }
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Focus Session</h3>
              <p className="text-sm text-muted-foreground">
                {formatTime(session.startTime)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-lg font-semibold text-foreground">
                {formatDuration(session.duration)}
              </div>
            </div>
            {session.completed && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Completed
              </Badge>
            )}
          </div>
        </div>
        
        {session.note && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              "{session.note}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
