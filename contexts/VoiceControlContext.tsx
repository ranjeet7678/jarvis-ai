import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearHistory } from '../services/historyService';

type Status = 'sleeping' | 'listening' | 'processing' | 'error' | 'off';
type CopyRequest = 'response' | null;

interface VoiceControlContextType {
  status: Status;
  isCapturing: boolean;
  transcript: string;
  spokenPrompt: string | null;
  copyRequest: CopyRequest;
  historyVersion: number;
  stream: MediaStream | null;
  speak: (text: string) => void;
  clearSpokenPrompt: () => void;
  clearCopyRequest: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  toggleListening: () => void;
  finishProcessing: () => void;
}

export const VoiceControlContext = createContext<VoiceControlContextType>({
  status: 'off',
  isCapturing: false,
  transcript: '',
  spokenPrompt: null,
  copyRequest: null,
  historyVersion: 0,
  stream: null,
  speak: () => {},
  clearSpokenPrompt: () => {},
  clearCopyRequest: () => {},
  isListening: false,
  isSpeaking: false,
  setStatus: () => {},
  toggleListening: () => {},
  finishProcessing: () => {},
});

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const WAKE_WORD = 'jarvis';
const WAKE_WORD_REGEX = new RegExp(`^${WAKE_WORD}\\b`, 'i');
const SILENCE_TIMEOUT = 8000; // 8 seconds

const COMMANDS = {
    NAV_HISTORY: /^(navigate to|go to|show me|show|open) (the |my )?history$/,
    NAV_GENERATOR: /^(navigate to|go to|show me|show|open) (the )?(generator|home|main screen)$/,
    START_CAPTURE: /^(start|begin) (screen )?capturing$/,
    STOP_CAPTURE: /^(stop|end) (screen )?capturing$/,
    CLEAR_HISTORY: /^(clear|delete|erase|remove) (my )?history$/,
    COPY_RESPONSE: /^(copy|save) (that|the)? response$/,
    STOP_LISTENING: /^(stop listening|go to sleep|that's all|never mind)$/,
};

export const VoiceControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('off');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [spokenPrompt, setSpokenPrompt] = useState<string | null>(null);
  const [copyRequest, setCopyRequest] = useState<CopyRequest>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const initialRecognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const preProcessingStatusRef = useRef<Status>('off');
  const silenceTimerRef = useRef<number | null>(null);
  
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const isSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const navigate = useNavigate();

  const speak = useCallback((text: string) => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (initialRecognitionRef.current) initialRecognitionRef.current.stop();
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
        console.error("Speech synthesis error");
        setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  }, []);
  
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = window.setTimeout(() => {
      if (statusRef.current === 'listening') {
        setStatus('sleeping');
        speak("Didn't hear anything. Going back to sleep.");
      }
    }, SILENCE_TIMEOUT);
  }, [speak]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (status === 'listening' || status === 'sleeping') {
      setStatus('off');
    } else if (status === 'off' || status === 'error') {
      setStatus('listening');
      speak("I'm listening.");
    }
  }, [status, speak]);
  
  const handleStartCapture = async () => {
    if (isCapturing) return;
    try {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        streamRef.current = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
        speak("Screen capture started.");
        mediaStream.getVideoTracks()[0].onended = () => { 
            setIsCapturing(false);
            streamRef.current = null;
            setStream(null);
        };
    } catch (err) {
        console.error("Screen capture error:", err);
        setStatus('error');
        speak("I couldn't start screen capture. Please grant permission.");
    }
  };

  const handleStopCapture = () => {
      if (!streamRef.current) return;
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
      setIsCapturing(false);
      speak("Screen capture stopped.");
  };
  
  const handleClearHistory = () => {
      clearHistory();
      setHistoryVersion(v => v + 1);
      speak("History cleared.");
      navigate('/history');
  }

  const processCommand = useCallback((command: string) => {
    const lowerCaseCommand = command.toLowerCase().trim();
    
    if (COMMANDS.NAV_HISTORY.test(lowerCaseCommand)) {
        navigate('/history');
        speak("Navigating to the history page.");
    } else if (COMMANDS.NAV_GENERATOR.test(lowerCaseCommand)) {
        navigate('/');
        speak("Navigating to the home screen.");
    } else if (COMMANDS.START_CAPTURE.test(lowerCaseCommand)) {
        handleStartCapture();
    } else if (COMMANDS.STOP_CAPTURE.test(lowerCaseCommand)) {
        handleStopCapture();
    } else if (COMMANDS.CLEAR_HISTORY.test(lowerCaseCommand)) {
        handleClearHistory();
    } else if (COMMANDS.COPY_RESPONSE.test(lowerCaseCommand)) {
        setCopyRequest('response');
    } else {
        speak("Processing your request.");
        setSpokenPrompt(command);
        navigate('/');
    }
  }, [navigate, speak]);

  const finishProcessing = useCallback(() => {
    const returnStatus = preProcessingStatusRef.current;
    
    if (returnStatus === 'off') {
        setStatus('off');
    } 
    else if (returnStatus === 'processing') {
        setStatus('sleeping');
    } 
    else {
        setStatus(returnStatus || 'sleeping');
    }
  }, []);

  const handleRecognitionError = useCallback((event: any, recognizerType: 'main' | 'initial') => {
    console.error(`${recognizerType} speech recognition error:`, event.error);

    if (statusRef.current === 'error' && event.error === 'network') {
        return;
    }

    if (event.error === 'network') {
        setStatus('error');
        speak("Voice control is unavailable due to a network issue. Please check your connection and then click the mic to retry.");
    } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        if (recognizerType === 'main') {
            setStatus('sleeping');
            speak("A voice recognition error occurred. I'll be on standby.");
        }
    }
  }, [speak]);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser.');
      setStatus('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      if (statusRef.current !== 'processing') setStatus('listening');
    };
    recognition.onend = () => {
      if (statusRef.current === 'listening' && !isSpeakingRef.current) {
        try { recognition.start(); } 
        catch(e) { console.error("Recognition restart failed:", e); setStatus('sleeping'); }
      }
    };
    recognition.onerror = (event: any) => handleRecognitionError(event, 'main');
    recognition.onresult = (event: any) => {
      resetSilenceTimer(); // Reset timer on any speech activity
      let finalTranscript = '', interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }
      setTranscript(interimTranscript);

      if (finalTranscript) {
        const command = finalTranscript.trim();
        setTranscript('');
        if (COMMANDS.STOP_LISTENING.test(command.toLowerCase())) {
            setStatus('sleeping');
            speak("Okay, going to sleep.");
        } else if (command) {
             preProcessingStatusRef.current = statusRef.current;
             setStatus('processing');
             processCommand(command);
        }
      }
    };

    const initialRecognition = new SpeechRecognition();
    initialRecognition.continuous = true;
    initialRecognition.interimResults = false;
    initialRecognitionRef.current = initialRecognition;

    initialRecognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (WAKE_WORD_REGEX.test(transcript)) {
            const command = transcript.substring(WAKE_WORD.length).trim();
            if (command) {
                preProcessingStatusRef.current = statusRef.current;
                setStatus('processing');
                processCommand(command);
            } else {
                setStatus('listening');
                speak("Hello, I'm ready.");
            }
        }
    };
    initialRecognition.onend = () => {
      if (statusRef.current === 'sleeping' && !isSpeakingRef.current) {
        try { initialRecognition.start(); } 
        catch(e) { console.error("Initial recognition restart failed:", e); }
      }
    };
    initialRecognition.onerror = (event: any) => handleRecognitionError(event, 'initial');


    if (isSpeaking) {
        recognitionRef.current?.stop();
        initialRecognitionRef.current?.stop();
        clearSilenceTimer();
    } else if (status === 'sleeping') {
        recognitionRef.current?.stop();
        try { initialRecognitionRef.current?.start(); } catch (e) { /* ignore */ }
        clearSilenceTimer();
    } else if (status === 'listening') {
        initialRecognitionRef.current?.stop();
        try { recognitionRef.current?.start(); } catch (e) { /* ignore */ }
        resetSilenceTimer();
    } else { // processing, error, or off
        initialRecognitionRef.current?.stop();
        recognitionRef.current?.stop();
        clearSilenceTimer();
    }

    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
      if (initialRecognitionRef.current) {
        initialRecognitionRef.current.onend = null;
        initialRecognitionRef.current.onerror = null;
        initialRecognitionRef.current.onresult = null;
        initialRecognitionRef.current.stop();
      }
    };
  }, [status, isSpeaking, processCommand, speak, handleRecognitionError, resetSilenceTimer, clearSilenceTimer]);

  const clearSpokenPrompt = () => setSpokenPrompt(null);
  const clearCopyRequest = () => setCopyRequest(null);

  const value = {
    status,
    isCapturing,
    transcript,
    spokenPrompt,
    copyRequest,
    historyVersion,
    stream,
    speak,
    clearSpokenPrompt,
    clearCopyRequest,
    isListening: status === 'listening',
    isSpeaking,
    setStatus,
    toggleListening,
    finishProcessing,
  };

  return (
    <VoiceControlContext.Provider value={value}>
      {children}
    </VoiceControlContext.Provider>
  );
};