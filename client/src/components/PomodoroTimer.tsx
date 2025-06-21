import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

export default function PomodoroTimer() {
  const {
    timerState,
    sessionNote,
    setSessionNote,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    getProgress,
    isCreatingSession,
  } = useTimer();

  const getPhaseDisplay = () => {
    switch (timerState.phase) {
      case 'focus':
        return 'Focus Session';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Focus Session';
    }
  };

  const getStatusDisplay = () => {
    if (timerState.isRunning) {
      return 'In Progress';
    } else if (timerState.currentTime === 0) {
      return 'Completed';
    } else if (timerState.startTime) {
      return 'Paused';
    } else {
      return 'Ready to Start';
    }
  };

  const progress = getProgress();
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/10">
      <CardContent className="p-8 text-center">
        {/* Timer Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {getPhaseDisplay()}
          </h2>
          
          {/* Circular Progress */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-primary transition-all duration-1000 progress-ring"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
            
            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-light text-foreground">
                {formatTime(timerState.currentTime)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {getStatusDisplay()}
              </div>
            </div>
          </div>
          
          {/* Linear Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground">
              Progress: {formatTime(timerState.duration - timerState.currentTime)} / {formatTime(timerState.duration)}
            </div>
          </div>
        </div>
        
        {/* Timer Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          {/* Start/Pause Button */}
          <Button
            size="lg"
            onClick={timerState.isRunning ? pauseTimer : startTimer}
            disabled={isCreatingSession}
            className="w-16 h-16 rounded-full focus-button-primary shadow-lg hover:shadow-xl"
          >
            {timerState.isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          
          {/* Reset Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            disabled={isCreatingSession}
            className="w-12 h-12 rounded-full"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          {/* Settings Button */}
          <Button
            variant="outline"
            size="lg"
            disabled={isCreatingSession}
            className="w-12 h-12 rounded-full"
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Session Note */}
        {timerState.phase === 'focus' && (
          <div className="max-w-md mx-auto">
            <Label htmlFor="session-note" className="text-sm font-medium mb-2 block">
              Session Note (Optional)
            </Label>
            <Textarea
              id="session-note"
              placeholder="What are you working on today?"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isCreatingSession}
            />
          </div>
        )}
        
        {/* Session Counter */}
        <div className="mt-6 text-sm text-muted-foreground">
          Completed Sessions Today: <span className="font-semibold text-foreground">{timerState.completedSessions}</span>
        </div>
      </CardContent>
    </Card>
  );
}
