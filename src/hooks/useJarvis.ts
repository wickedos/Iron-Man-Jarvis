import { useState, useCallback } from 'react';
import { useVoiceRecognition } from './useVoiceRecognition';
import { Message } from '@/components/jarvis/ConversationLog';
import { useToast } from '@/hooks/use-toast';

type JarvisStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export const useJarvis = () => {
  const [status, setStatus] = useState<JarvisStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const addMessage = useCallback((type: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const processMessage = useCallback(async (userInput: string) => {
    setStatus('processing');
    addMessage('user', userInput);

    try {
      // For now, simulate AI processing with a simple response
      // TODO: Replace with actual AI processing via Supabase Edge Function
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        "I'm processing your request, sir.",
        "Understood. How may I assist you further?",
        "I'm here to help with whatever you need.",
        "Your request has been noted. What else can I do for you?",
        "I'm analyzing the situation and will provide an update shortly."
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage('assistant', response);
      
      setStatus('speaking');
      
      // TODO: Replace with actual TTS using ElevenLabs API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('idle');
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      setStatus('idle');
    }
  }, [addMessage, toast]);

  const handleTranscript = useCallback((transcript: string) => {
    console.log('Received transcript:', transcript);
    processMessage(transcript);
  }, [processMessage]);

  const handleError = useCallback((error: string) => {
    console.error('Voice recognition error:', error);
    toast({
      title: "Voice Recognition Error",
      description: error,
      variant: "destructive",
    });
    setStatus('idle');
  }, [toast]);

  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    onTranscript: handleTranscript,
    onError: handleError
  });

  const handleMicrophoneClick = useCallback(() => {
    if (status === 'processing' || status === 'speaking') {
      return;
    }

    if (isListening) {
      stopListening();
      setStatus('idle');
    } else {
      setStatus('listening');
      startListening();
    }
  }, [status, isListening, startListening, stopListening]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    if (isListening) {
      stopListening();
      setStatus('idle');
    }
  }, [isListening, stopListening]);

  return {
    status: isListening ? 'listening' : status,
    messages,
    isSupported,
    handleMicrophoneClick,
    clearConversation
  };
};