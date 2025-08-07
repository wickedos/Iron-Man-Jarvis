import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationLogProps {
  messages: Message[];
  className?: string;
}

export const ConversationLog = ({ messages, className }: ConversationLogProps) => {
  return (
    <ScrollArea className={cn("h-80 w-full", className)}>
      <div className="space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-primary/50" />
            <p>JARVIS is ready to assist you.</p>
            <p className="text-sm mt-2">Press the microphone to start talking.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 p-3 rounded-lg jarvis-transition",
                message.type === 'user' 
                  ? "jarvis-surface ml-8" 
                  : "jarvis-surface-elevated mr-8"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.type === 'user' 
                  ? "bg-secondary" 
                  : "bg-primary/20"
              )}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.type === 'user' ? 'You' : 'JARVIS'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};