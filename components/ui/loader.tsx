import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export function Loader({ size = 'md', message = 'Loading...', fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="flex flex-col items-center space-y-3 p-6">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}