import { cn } from "@/lib/utils";
import { Activity, Ear, MessageSquare, Square } from "lucide-react";

type Status = 'idle' | 'listening' | 'processing' | 'speaking';

interface JarvisStatusProps {
  status: Status;
  className?: string;
}

export const JarvisStatus = ({ status, className }: JarvisStatusProps) => {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'idle':
        return {
          icon: Square,
          text: 'Standby',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50'
        };
      case 'listening':
        return {
          icon: Ear,
          text: 'Listening...',
          color: 'text-primary',
          bgColor: 'bg-primary/20'
        };
      case 'processing':
        return {
          icon: Activity,
          text: 'Processing...',
          color: 'text-accent',
          bgColor: 'bg-accent/20'
        };
      case 'speaking':
        return {
          icon: MessageSquare,
          text: 'Speaking...',
          color: 'text-primary',
          bgColor: 'bg-primary/20'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-full jarvis-transition",
      config.bgColor,
      status === 'listening' && "jarvis-pulse",
      className
    )}>
      <Icon className={cn("w-4 h-4", config.color)} />
      <span className={cn("text-sm font-medium", config.color)}>
        {config.text}
      </span>
      
      {status === 'processing' && (
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
};