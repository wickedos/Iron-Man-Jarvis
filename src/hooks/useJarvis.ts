import { useState, useCallback } from 'react';
import { useVoiceRecognition } from './useVoiceRecognition';
import { Message } from '@/components/jarvis/ConversationLog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Get user's custom webhook URL from localStorage
      const customWebhookUrl = localStorage.getItem('jarvis_webhook_url');
      
      // Send message to n8n webhook for AI processing
      const { data: aiData, error: aiError } = await supabase.functions.invoke('n8n-webhook', {
        body: {
          message: userInput,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
          webhookUrl: customWebhookUrl // Pass custom webhook URL
        }
      });

      if (aiError) {
        throw new Error(`AI processing failed: ${aiError.message}`);
      }

      const aiResponse = aiData?.response || "I'm here to assist you, sir.";
      addMessage('assistant', aiResponse);
      
      setStatus('speaking');
      
      // Generate speech using ElevenLabs TTS
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: aiResponse,
          voiceId: "9BWtsMINqrJLrRacOk9x" // Aria voice
        }
      });

      if (ttsError) {
        console.error('TTS error:', ttsError);
        // Continue without audio if TTS fails
        setStatus('idle');
        return;
      }

      // Play the generated audio
      if (ttsData?.audioContent) {
        const audioBlob = new Blob([
          Uint8Array.from(atob(ttsData.audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setStatus('idle');
        };
        
        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          setStatus('idle');
        };
        
        await audio.play();
      } else {
        setStatus('idle');
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      setStatus('idle');
    }
  }, [addMessage, toast, messages]);

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