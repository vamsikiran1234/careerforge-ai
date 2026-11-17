import { useState, useRef, useEffect, useCallback } from 'react';

interface UseVoiceRecognitionOptions {
  onTranscript?: (transcript: string) => void;
  lang?: string;
}

export function useVoiceRecognition({ onTranscript, lang = 'en-US' }: UseVoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  // Check Web Speech API availability
  const isSupported = typeof window !== 'undefined' && 
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    isManuallyStoppedRef.current = false;

    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop any existing recognition instance first to avoid InvalidStateError
    if (recognitionRef.current) {
      stopListening();
      await new Promise(r => setTimeout(r, 100));
    }

    // Request microphone permission explicitly to avoid silent browser blocks
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop media stream tracks so SpeechRecognition can take exclusive audio control
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
          return;
        }
      }
    }

    try {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalChunk += text;
          } else {
            interimChunk += text;
          }
        }

        const recognizedText = (finalChunk || interimChunk).trim();
        if (recognizedText && onTranscript) {
          onTranscript(recognizedText);
        }
      };

      recognition.onerror = (event: any) => {
        // "no-speech" is common during pauses, ignore unless manually stopped
        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please enable microphone permissions in your browser URL bar.');
        } else if (event.error === 'network') {
          setError('Speech recognition network error. Please verify your connection.');
        } else {
          setError(`Speech error: ${event.error}`);
        }

        setIsListening(false);
      };

      recognition.onend = () => {
        // If not manually stopped, keep listening state consistent
        if (!isManuallyStoppedRef.current) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setError(err?.message || 'Failed to start speech recognition.');
      setIsListening(false);
    }
  }, [isSupported, lang, onTranscript, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}

export default useVoiceRecognition;
