import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextInputProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  className?: string;
}

export const TextInput = ({ onSend, isProcessing, className }: TextInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message to JARVIS..."
        disabled={isProcessing}
        className="flex-1 jarvis-surface border-primary/20 focus:border-primary"
      />
      <Button
        type="submit"
        disabled={!message.trim() || isProcessing}
        className="jarvis-surface-elevated border border-primary/20 hover:border-primary/50"
        variant="ghost"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};