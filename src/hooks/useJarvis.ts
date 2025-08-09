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
    console.log('🤖 JARVIS: Processing message:', userInput);
    setStatus('processing');
    addMessage('user', userInput);

    try {
      // Get user's custom webhook URL from localStorage with validation
      let customWebhookUrl;
      try {
        customWebhookUrl = localStorage.getItem('jarvis_webhook_url');
        console.log('🔗 Custom webhook URL:', customWebhookUrl ? 'Found' : 'Not set');
      } catch (storageError) {
        console.warn('⚠️ localStorage access failed:', storageError);
      }
      
      console.log('🚀 Calling n8n-webhook...');
      // Send message to n8n webhook for AI processing
      const { data: aiData, error: aiError } = await supabase.functions.invoke('n8n-webhook', {
        body: {
          message: userInput,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
          webhookUrl: customWebhookUrl // Pass custom webhook URL
        }
      });

      console.log('📡 n8n-webhook response:', { aiData, aiError });

      if (aiError) {
        throw new Error(`AI processing failed: ${aiError.message}`);
      }

      const aiResponse = aiData?.response || "I'm here to assist you, sir.";
      console.log('🤖 AI Response:', aiResponse);
      addMessage('assistant', aiResponse);
      
      setStatus('speaking');
      
      console.log('🎵 Generating TTS...');
      // Generate speech using ElevenLabs TTS
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: aiResponse,
          voiceId: "9BWtsMINqrJLrRacOk9x" // Aria voice
        }
      });

      console.log('🔊 TTS response:', { ttsData: !!ttsData, ttsError });

      if (ttsError) {
        console.error('❌ TTS error:', ttsError);
        // Continue without audio if TTS fails
        toast({
          title: "Audio Error",
          description: "Failed to generate speech, but continuing in text mode.",
          variant: "destructive",
        });
        setStatus('idle');
        return;
      }

      // Play the generated audio
      if (ttsData?.audioContent) {
        console.log('🎤 Playing audio...');
        try {
          const audioBlob = new Blob([
            Uint8Array.from(atob(ttsData.audioContent), c => c.charCodeAt(0))
          ], { type: 'audio/mpeg' });
          
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            console.log('✅ Audio playback completed');
            URL.revokeObjectURL(audioUrl);
            setStatus('idle');
          };
          
          audio.onerror = (error) => {
            console.error('❌ Audio playback error:', error);
            URL.revokeObjectURL(audioUrl);
            setStatus('idle');
            toast({
              title: "Audio Playback Error",
              description: "Failed to play audio response.",
              variant: "destructive",
            });
          };
          
          audio.onloadstart = () => {
            console.log('🔄 Audio loading started...');
          };
          
          audio.oncanplay = () => {
            console.log('▶️ Audio ready to play');
          };
          
          await audio.play();
          console.log('🎵 Audio started playing');
          
        } catch (audioError) {
          console.error('❌ Audio creation/playback failed:', audioError);
          setStatus('idle');
          toast({
            title: "Audio Error",
            description: "Failed to create or play audio.",
            variant: "destructive",
          });
        }
      } else {
        console.log('⚠️ No audio content received');
        setStatus('idle');
      }
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      setStatus('idle');
    }
  }, [addMessage, toast, messages]);

  const handleTranscript = useCallback((transcript: string) => {
    console.log('🎤 Received transcript:', transcript);
    if (transcript.trim()) {
      processMessage(transcript);
    } else {
      console.log('⚠️ Empty transcript received, ignoring');
    }
  }, [processMessage]);

  const handleError = useCallback((error: string) => {
    console.error('❌ Voice recognition error:', error);
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
    console.log('🎤 Microphone button clicked:', { status, isListening, isSupported });
    
    if (!isSupported) {
      console.log('❌ Speech recognition not supported');
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (status === 'processing' || status === 'speaking') {
      console.log('⚠️ System busy, ignoring microphone click');
      return;
    }

    if (isListening) {
      console.log('🛑 Stopping listening...');
      stopListening();
      setStatus('idle');
    } else {
      console.log('🎤 Starting listening...');
      setStatus('listening');
      startListening();
    }
  }, [status, isListening, isSupported, startListening, stopListening, toast]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    if (isListening) {
      stopListening();
      setStatus('idle');
    }
  }, [isListening, stopListening]);

  const handleTextMessage = useCallback((message: string) => {
    console.log('📝 Text message received:', message);
    processMessage(message);
  }, [processMessage]);

  return {
    status: isListening ? 'listening' : status,
    messages,
    isSupported,
    handleMicrophoneClick,
    handleTextMessage,
    clearConversation
  };
};