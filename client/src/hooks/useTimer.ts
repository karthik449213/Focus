import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useSettings } from '@/contexts/SettingsContext';
import type { InsertSession } from '@shared/schema';

export interface TimerState {
  isRunning: boolean;
  currentTime: number;
  duration: number;
  phase: 'focus' | 'short-break' | 'long-break';
  startTime: Date | null;
  completedSessions: number;
}

export function useTimer() {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionNote, setSessionNote] = useState('');

  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('focushero-timer-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null,
          isRunning: false, // Never auto-resume on page load
        };
      } catch {
        // Fall through to default state
      }
    }
    
    return {
      isRunning: false,
      currentTime: settings?.focusDuration || 1500,
      duration: settings?.focusDuration || 1500,
      phase: 'focus',
      startTime: null,
      completedSessions: 0,
    };
  });

  // Update timer duration when settings change
  useEffect(() => {
    if (settings && !timerState.isRunning) {
      setTimerState(prev => ({
        ...prev,
        currentTime: settings.focusDuration,
        duration: settings.focusDuration,
      }));
    }
  }, [settings, timerState.isRunning]);

  // Save timer state to localStorage
  useEffect(() => {
    localStorage.setItem('focushero-timer-state', JSON.stringify(timerState));
  }, [timerState]);

  const createSessionMutation = useMutation({
    mutationFn: async (session: InsertSession) => {
      const response = await apiRequest('POST', '/api/session', session);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/session'] });
    },
  });

  const tick = useCallback(() => {
    setTimerState(prev => {
      if (prev.currentTime <= 1) {
        // Timer completed
        return {
          ...prev,
          currentTime: 0,
          isRunning: false,
        };
      }
      return {
        ...prev,
        currentTime: prev.currentTime - 1,
      };
    });
  }, []);

  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, tick]);

  // Handle timer completion
  useEffect(() => {
    if (!timerState.isRunning && timerState.currentTime === 0 && timerState.startTime) {
      handleTimerComplete();
    }
  }, [timerState.currentTime, timerState.isRunning]);

  const handleTimerComplete = useCallback(async () => {
    if (!timerState.startTime) return;

    const duration = timerState.duration;
    
    // Save session if it was a focus session
    if (timerState.phase === 'focus') {
      try {
        await createSessionMutation.mutateAsync({
          startTime: timerState.startTime,
          duration,
          note: sessionNote.trim() || null,
          completed: true,
        });
        
        setTimerState(prev => ({
          ...prev,
          completedSessions: prev.completedSessions + 1,
        }));
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }

    // Play notification sound if enabled
    if (settings?.soundNotifications) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjaB0fPSgS4HJXzE896VOgYYXrHp563iEgxOoePwuVseCTeR2O3DiD8MFGm57uOWWA0LTqTh8bbRHQs5ltzrwodBCRVjr+PvnVwNDUil4e2zHA45gdPwznsm');
        audio.play().catch(() => {
          // Ignore audio play errors (browser policy)
        });
      } catch {
        // Ignore audio errors
      }
    }

    // Show browser notification if enabled and permission granted
    if (settings?.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusHero', {
        body: timerState.phase === 'focus' ? 'Focus session completed! Time for a break.' : 'Break time is over! Ready for another focus session?',
        icon: '/favicon.ico',
      });
    }

    // Auto-transition to next phase
    const nextPhase = getNextPhase();
    const nextDuration = getNextDuration(nextPhase);
    
    setTimerState(prev => ({
      ...prev,
      phase: nextPhase,
      currentTime: nextDuration,
      duration: nextDuration,
      startTime: null,
    }));

    // Clear session note
    setSessionNote('');
  }, [timerState, settings, sessionNote, createSessionMutation]);

  const getNextPhase = (): 'focus' | 'short-break' | 'long-break' => {
    if (timerState.phase === 'focus') {
      // After 4 focus sessions, take a long break
      return (timerState.completedSessions + 1) % 4 === 0 ? 'long-break' : 'short-break';
    }
    return 'focus';
  };

  const getNextDuration = (phase: 'focus' | 'short-break' | 'long-break'): number => {
    if (!settings) return 1500;
    
    switch (phase) {
      case 'focus':
        return settings.focusDuration;
      case 'short-break':
        return settings.shortBreakDuration;
      case 'long-break':
        return settings.longBreakDuration;
      default:
        return settings.focusDuration;
    }
  };

  const startTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      startTime: prev.startTime || new Date(),
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    const duration = settings?.focusDuration || 1500;
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      currentTime: duration,
      duration,
      phase: 'focus',
      startTime: null,
    }));
    setSessionNote('');
  }, [settings]);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback((): number => {
    return ((timerState.duration - timerState.currentTime) / timerState.duration) * 100;
  }, [timerState.currentTime, timerState.duration]);

  return {
    timerState,
    sessionNote,
    setSessionNote,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    getProgress,
    isCreatingSession: createSessionMutation.isPending,
  };
}
