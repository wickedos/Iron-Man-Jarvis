import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Square } from "lucide-react";

interface JarvisButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
  className?: string;
}

export const JarvisButton = ({ 
  isListening, 
  isProcessing, 
  onClick, 
  className 
}: JarvisButtonProps) => {
  const getIcon = () => {
    if (isProcessing) return Square;
    if (isListening) return MicOff;
    return Mic;
  };

  const Icon = getIcon();

  return (
    <Button
      onClick={onClick}
      disabled={isProcessing}
      className={cn(
        "relative w-24 h-24 rounded-full jarvis-surface-elevated border-2 transition-all duration-300",
        isListening 
          ? "border-primary jarvis-glow-strong animate-pulse" 
          : "border-border hover:border-primary/50",
        isProcessing && "opacity-75 cursor-not-allowed",
        className
      )}
      variant="ghost"
    >
      <Icon 
        className={cn(
          "w-8 h-8 transition-all duration-300",
          isListening ? "text-primary" : "text-muted-foreground",
          isProcessing && "text-destructive"
        )} 
      />
      
      {/* Outer glow ring */}
      {isListening && (
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
      )}
    </Button>
  );
};