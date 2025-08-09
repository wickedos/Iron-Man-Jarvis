import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PhoneCall, PhoneOff, MessageSquare, Mic, StopCircle } from "lucide-react";

interface ConversationControlsProps {
  conversationMode: 'single' | 'continuous';
  isConversationActive: boolean;
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onToggleMode: () => void;
  onStartConversation: () => void;
  onStopConversation: () => void;
  onInterrupt: () => void;
  className?: string;
}

export const ConversationControls = ({
  conversationMode,
  isConversationActive,
  status,
  onToggleMode,
  onStartConversation,
  onStopConversation,
  onInterrupt,
  className
}: ConversationControlsProps) => {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Mode:</span>
        <Button
          onClick={onToggleMode}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isConversationActive}
        >
          {conversationMode === 'single' ? <MessageSquare className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
          {conversationMode === 'single' ? 'Single Response' : 'Continuous Chat'}
        </Button>
        {conversationMode === 'continuous' && (
          <Badge variant={isConversationActive ? "default" : "secondary"} className="text-xs">
            {isConversationActive ? 'Active' : 'Inactive'}
          </Badge>
        )}
      </div>

      {/* Conversation Controls */}
      {conversationMode === 'continuous' && (
        <div className="flex items-center gap-2">
          {!isConversationActive ? (
            <Button
              onClick={onStartConversation}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              size="sm"
            >
              <PhoneCall className="w-4 h-4" />
              Start Conversation
            </Button>
          ) : (
            <>
              <Button
                onClick={onStopConversation}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Conversation
              </Button>
              
              {status === 'speaking' && (
                <Button
                  onClick={onInterrupt}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-accent text-accent hover:bg-accent/10"
                >
                  <StopCircle className="w-4 h-4" />
                  Interrupt
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Status Information */}
      {conversationMode === 'continuous' && isConversationActive && (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="font-medium mb-1">💡 Conversation Tips:</p>
          <ul className="space-y-1">
            <li>• Speak naturally - I'll respond automatically</li>
            <li>• Wait for the beep before speaking</li>
            <li>• Say "goodbye" or click "End" to finish</li>
            {status === 'speaking' && <li>• Click "Interrupt" to speak while I'm talking</li>}
          </ul>
        </div>
      )}
    </div>
  );
};