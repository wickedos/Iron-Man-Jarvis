import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecognitionOptions {
  onTranscript: (transcript: string) => void;
  onError: (error: string) => void;
}

export const useVoiceRecognition = ({ onTranscript, onError }: UseVoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(() => {
    // Check support immediately on initialization
    if (typeof window === 'undefined') {
      console.log('🔍 Speech Recognition: Window undefined (SSR)');
      return false;
    }
    
    // Enhanced browser detection with detailed logging
    const hasWebkit = 'webkitSpeechRecognition' in window;
    const hasNative = 'SpeechRecognition' in window;
    const hasSpeechRecognition = hasWebkit || hasNative;
    
    // Get browser info for debugging
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome');
    const isEdge = userAgent.includes('Edge');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    
    console.log('🔍 Speech Recognition Support Check:', {
      hasWebkit,
      hasNative,
      hasSpeechRecognition,
      browser: { isChrome, isEdge, isSafari, isFirefox },
      userAgent,
      secure: window.location.protocol === 'https:',
      localhost: window.location.hostname === 'localhost'
    });
    
    if (!hasSpeechRecognition) {
      console.warn('❌ Speech Recognition not supported. Try Chrome, Edge, or Safari.');
    } else {
      console.log('✅ Speech Recognition is supported!');
    }
    
    return hasSpeechRecognition;
  });
  const recognitionRef = useRef<any>(null);

  const initializeRecognition = useCallback(() => {
    console.log('🔧 Initializing Speech Recognition...');
    
    if (typeof window === 'undefined') {
      console.error('❌ Window undefined during initialization');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition constructor not available');
      setIsSupported(false);
      onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      
      // Enhanced configuration
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      console.log('✅ Speech Recognition configured:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });

      recognition.onstart = () => {
        console.log('🎤 Speech Recognition Started');
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log('🛑 Speech Recognition Ended');
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        console.log('📝 Speech Recognition Result:', event);
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('✅ Final transcript:', transcript);
          } else {
            interimTranscript += transcript;
            console.log('⏳ Interim transcript:', transcript);
          }
        }

        if (finalTranscript.trim()) {
          console.log('🚀 Sending final transcript to handler:', finalTranscript.trim());
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        console.error('❌ Speech Recognition Error:', {
          error: event.error,
          message: event.message,
          type: event.type,
          timeStamp: event.timeStamp
        });
        
        // Provide more specific error messages
        let userFriendlyError = errorMessage;
        switch (event.error) {
          case 'network':
            userFriendlyError = 'Network error. Please check your internet connection.';
            break;
          case 'not-allowed':
            userFriendlyError = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            userFriendlyError = 'No speech detected. Please try speaking again.';
            break;
          case 'audio-capture':
            userFriendlyError = 'Audio capture failed. Please check your microphone.';
            break;
          case 'service-not-allowed':
            userFriendlyError = 'Speech recognition service not allowed. Please use HTTPS.';
            break;
        }
        
        onError(userFriendlyError);
        setIsListening(false);
      };

      recognition.onspeechstart = () => {
        console.log('🗣️ Speech started');
      };

      recognition.onspeechend = () => {
        console.log('🤐 Speech ended');
      };

      recognition.onnomatch = () => {
        console.log('🤷 No match found');
      };

      recognitionRef.current = recognition;
      setIsSupported(true);
      console.log('✅ Speech Recognition initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Speech Recognition:', error);
      setIsSupported(false);
      onError('Failed to initialize speech recognition. Please refresh and try again.');
      return false;
    }
  }, [onTranscript, onError]);

  const startListening = useCallback(() => {
    console.log('🎯 Starting speech recognition...');
    
    // Check if we need to initialize
    if (!recognitionRef.current) {
      console.log('🔧 Recognition not initialized, initializing now...');
      if (!initializeRecognition()) {
        console.error('❌ Failed to initialize recognition');
        return;
      }
    }

    // Check if already listening
    if (isListening) {
      console.log('⚠️ Already listening, ignoring start request');
      return;
    }

    try {
      console.log('🚀 Calling recognition.start()...');
      recognitionRef.current?.start();
    } catch (error) {
      console.error('❌ Error starting recognition:', error);
      
      // Handle specific errors
      if (error.name === 'InvalidStateError') {
        console.log('♻️ Recognition already started, stopping and restarting...');
        try {
          recognitionRef.current?.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 100);
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
          onError('Failed to start voice recognition. Please try again.');
        }
      } else {
        onError(`Failed to start voice recognition: ${error.message}`);
      }
    }
  }, [initializeRecognition, onError, isListening]);

  const stopListening = useCallback(() => {
    console.log('🛑 Stopping speech recognition...');
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Recognition stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping recognition:', error);
      }
    } else {
      console.log('⚠️ Recognition not active or not initialized');
    }
  }, [isListening]);

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