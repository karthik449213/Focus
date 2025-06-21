import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Quote, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MotivationResponse {
  quote: string;
}

export default function MotivationalQuote() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: motivation, isLoading, error } = useQuery<MotivationResponse>({
    queryKey: ['/api/motivation'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/motivation');
      return response.json();
    },
    onMutate: () => {
      setIsRefreshing(true);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/motivation'], data);
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (error) {
    return (
      <Card className="mb-8 border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                <Quote className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-destructive mb-2">Failed to load motivational quote</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Quote className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ) : (
              <>
                <blockquote className="text-lg text-foreground/90 italic leading-relaxed mb-4">
                  "{motivation?.quote || 'Stay focused, you\'re doing amazing!'}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI-Generated Motivation</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-primary/10 border-primary/30 hover:bg-primary/20"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    New Quote
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
