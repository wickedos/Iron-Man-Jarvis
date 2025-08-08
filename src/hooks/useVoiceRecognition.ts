import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecognitionOptions {
  onTranscript: (transcript: string) => void;
  onError: (error: string) => void;
}

export const useVoiceRecognition = ({ onTranscript, onError }: UseVoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(() => {
    // Check support immediately on initialization
    if (typeof window === 'undefined') return false;
    
    // More robust browser detection
    const hasWebkit = 'webkitSpeechRecognition' in window;
    const hasNative = 'SpeechRecognition' in window;
    
    console.log('Speech Recognition Support Check:', {
      hasWebkit,
      hasNative,
      userAgent: navigator.userAgent
    });
    
    return hasWebkit || hasNative;
  });
  const recognitionRef = useRef<any>(null);

  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);
    return true;
  }, [onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (!initializeRecognition()) {
        onError('Speech recognition is not supported in this browser');
        return;
      }
    }

    try {
      recognitionRef.current?.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      onError('Failed to start voice recognition');
    }
  }, [initializeRecognition, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    initializeRecognition
  };
};

// Type definitions for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}