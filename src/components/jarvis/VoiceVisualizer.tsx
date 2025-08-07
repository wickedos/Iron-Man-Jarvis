import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export const VoiceVisualizer = ({ 
  isListening = false, 
  isSpeaking = false, 
  className 
}: VoiceVisualizerProps) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    if (isListening || isSpeaking) {
      const interval = setInterval(() => {
        setBars(Array.from({ length: 12 }, () => Math.random() * 100 + 20));
      }, 150);
      return () => clearInterval(interval);
    } else {
      setBars(Array.from({ length: 12 }, () => 20));
    }
  }, [isListening, isSpeaking]);

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-2 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-150",
            (isListening || isSpeaking) && "animate-pulse"
          )}
          style={{
            height: `${height}px`,
            animationDelay: `${index * 100}ms`,
          }}
        />
      ))}
    </div>
  );
};