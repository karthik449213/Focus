import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import SessionCard from '@/components/SessionCard';
import { Filter, Download } from 'lucide-react';
import type { Session } from '@shared/schema';

export default function SessionHistory() {
  const [periodFilter, setPeriodFilter] = useState('7');
  const [durationFilter, setDurationFilter] = useState('all');

  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: ['/api/session'],
  });

  const filterSessions = (sessions: Session[] | undefined) => {
    if (!sessions) return [];

    let filtered = [...sessions];

    // Filter by period
    if (periodFilter !== 'all') {
      const days = parseInt(periodFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(session => 
        new Date(session.startTime) >= cutoffDate
      );
    }

    // Filter by duration
    if (durationFilter !== 'all') {
      const targetDuration = parseInt(durationFilter);
      filtered = filtered.filter(session => 
        Math.abs(session.duration - targetDuration) < 60 // Within 1 minute
      );
    }

    return filtered;
  };

  const filteredSessions = filterSessions(sessions);

  const handleExportData = () => {
    if (!filteredSessions.length) return;

    const dataToExport = filteredSessions.map(session => ({
      startTime: session.startTime,
      duration: session.duration,
      note: session.note,
      completed: session.completed,
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focushero-sessions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load session history. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Session History</h1>
        <p className="text-muted-foreground">
          Track your focus sessions and productivity over time
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Period:</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Duration:</label>
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All durations</SelectItem>
                  <SelectItem value="1500">25 minutes</SelectItem>
                  <SelectItem value="3000">50 minutes</SelectItem>
                  <SelectItem value="900">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={!filteredSessions.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-16 ml-auto" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-4">
                {sessions?.length === 0 
                  ? "No focus sessions recorded yet. Start your first session!" 
                  : "No sessions match the current filters."}
              </p>
              {sessions?.length === 0 && (
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Start Your First Session
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        )}
      </div>

      {/* Summary */}
      {filteredSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-foreground">
                  {filteredSessions.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">
                  {Math.floor(
                    filteredSessions.reduce((total, session) => total + session.duration, 0) / 60
                  )}m
                </div>
                <div className="text-sm text-muted-foreground">Total Focus Time</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">
                  {Math.floor(
                    filteredSessions.reduce((total, session) => total + session.duration, 0) / 
                    filteredSessions.length / 60
                  )}m
                </div>
                <div className="text-sm text-muted-foreground">Average Session</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
