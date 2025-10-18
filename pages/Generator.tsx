import React, { useState, useEffect, useContext, useRef } from 'react';
import { getAIResponse } from '../services/geminiService';
import { saveToHistory } from '../services/historyService';
import Loader from '../components/Loader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Icon from '../components/Icon';
import { VoiceControlContext } from '../contexts/VoiceControlContext';

type WaveformMode = 'listening' | 'speaking' | 'idle';

const Waveform: React.FC<{ mode: WaveformMode }> = ({ mode }) => {
    const isAnimated = mode === 'listening' || mode === 'speaking';
    const speakingClass = mode === 'speaking' ? 'speaking' : '';
    const groupOpacity = mode === 'speaking' ? 1 : mode === 'listening' ? 0.7 : 0.4;

    return (
        <div className="w-full max-w-2xl mx-auto h-32 relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 1000 128" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
                <g style={{ opacity: groupOpacity, transition: 'opacity 0.5s ease-in-out' }}>
                    <path className={`${isAnimated ? 'wave-path wave-path-1' : ''} ${speakingClass}`} fill="url(#wave-gradient)" style={{ opacity: 0.3 }} d="M-200,64 C200,128 300,0 700,64 S1200,0 1600,64 V128 H-200 Z M-200,64 C200,128 300,0 700,64 S1200,0 1600,64 V128 H-200 Z" />
                    <path className={`${isAnimated ? 'wave-path wave-path-2' : ''} ${speakingClass}`} fill="url(#wave-gradient)" style={{ opacity: 0.5 }} d="M-200,80 C350,150 400,10 800,80 S1250,10 1700,80 V128 H-200 Z M-200,80 C350,150 400,10 800,80 S1250,10 1700,80 V128 H-200 Z" />
                    <path className={`${isAnimated ? 'wave-path wave-path-3' : ''} ${speakingClass}`} fill="url(#wave-gradient)" style={{ opacity: 0.2 }} d="M-200,50 C220,100 350,20 750,50 S1180,100 1650,50 V128 H-200 Z M-200,50 C220,100 350,20 750,50 S1180,100 1650,50 V128 H-200 Z" />
                </g>
            </svg>
        </div>
    );
};


const Generator: React.FC = () => {
  const [promptText, setPromptText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isErrorCopied, setIsErrorCopied] = useState(false);
  
  const { spokenPrompt, clearSpokenPrompt, speak, status, copyRequest, clearCopyRequest, toggleListening, isListening, isSpeaking, finishProcessing } = useContext(VoiceControlContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const handleSubmit = async (currentPrompt: string) => {
    if (!currentPrompt.trim()) return;
    setIsLoading(true);
    setResult('');
    setError(null);
    setErrorDetails(null);
    
    try {
      const aiResponse = await getAIResponse(currentPrompt);
      setResult(aiResponse);
      saveToHistory(currentPrompt, aiResponse);
      speak("Here is the response.");
    } catch (e) {
      const err = e as Error;
      const [userMessage, details] = err.message.split('||');
      setError(userMessage || 'An unexpected error occurred.');
      if (details) {
          const cleanedDetails = details.replace(/^Details:\s*/, '');
          setErrorDetails(cleanedDetails);
      } else {
          setErrorDetails(null);
      }
      console.error("AI Error Details:", details);
      speak(userMessage || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      finishProcessing();
    }
  };

  const submitTextPrompt = () => {
    if (promptText.trim() && !isLoading) {
        handleSubmit(promptText);
        setPromptText('');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTextPrompt();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitTextPrompt();
    }
  };

  useEffect(() => {
    if (spokenPrompt) {
      handleSubmit(spokenPrompt);
      clearSpokenPrompt();
    }
  }, [spokenPrompt]);

  useEffect(() => {
    if (copyRequest === 'response' && result) {
        navigator.clipboard.writeText(result).then(() => {
          speak("Copied to clipboard.");
        }).catch(err => {
          console.error('Failed to copy text: ', err);
          speak("Sorry, I couldn't copy that to the clipboard.");
        });
        clearCopyRequest();
    }
  }, [copyRequest, result, speak, clearCopyRequest]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
    }
  }, [promptText]);

  const handleCopyError = () => {
    if (!errorDetails) return;
    navigator.clipboard.writeText(errorDetails).then(() => {
      setIsErrorCopied(true);
      setTimeout(() => setIsErrorCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy error details: ', err);
    });
  };

  const renderMainContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 p-6 rounded-xl shadow-lg animate-slide-up-fade-in w-full max-w-4xl space-y-4">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <Icon name="error" className="h-8 w-8 text-red-400 mt-1"/>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-xl text-red-300">Request Failed</h3>
                    <p className="text-red-200 mt-1">{error}</p>
                </div>
            </div>
            {errorDetails && (
                <div className="bg-red-950/50 rounded-lg border border-red-800/60 overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 bg-red-950/70">
                        <h4 className="text-sm font-semibold text-red-300 uppercase tracking-wider">Technical Details</h4>
                        <button 
                            onClick={handleCopyError}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-red-800/70 hover:bg-red-700 transition-colors duration-200 text-xs font-medium text-red-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-950 focus:ring-red-500"
                            aria-label="Copy error details"
                        >
                            <Icon name={isErrorCopied ? 'check' : 'clipboard'} className="h-4 w-4" />
                            <span>{isErrorCopied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                    <div className="p-4 max-h-56 overflow-y-auto">
                        <pre className="text-sm font-mono text-red-300 whitespace-pre-wrap break-words">{errorDetails}</pre>
                    </div>
                </div>
            )}
        </div>
      );
    }
    if (result) {
      return (
        <div className="bg-gray-800/90 rounded-xl shadow-lg p-6 border border-gray-700 relative backdrop-blur-sm animate-slide-up-fade-in w-full max-w-4xl">
          <div className="markdown-content text-gray-300 space-y-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </div>
      );
    }
    return (
        <div className="text-center flex flex-col items-center justify-center animate-fade-in-short">
            <h2 className="text-4xl font-bold text-gray-200 mb-2">Talk to Jarvis</h2>
            <p className="text-lg text-gray-400">Press the mic or say "Jarvis" to begin.</p>
        </div>
    );
  };
  
  const waveformMode = isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle';
  const isMicActive = status === 'listening' || status === 'sleeping';

  const getMicIcon = () => {
    if (isSpeaking) return 'speaking';
    if (isMicActive) return 'microphone';
    return 'microphone-slash';
  };
  
  const micStatusText = () => {
    if (status === 'listening') return 'Mic is ON';
    if (status === 'sleeping') return 'On Standby';
    return 'Mic is OFF';
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-grow flex flex-col justify-center items-center p-4 overflow-y-auto min-h-0">
        {renderMainContent()}
      </div>

      <div className="flex-shrink-0 flex flex-col justify-center items-center p-6 space-y-4 w-full max-w-2xl mx-auto">
        <form onSubmit={handleTextSubmit} className="w-full relative">
            <textarea
                ref={textareaRef}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening for voice..." : "Type your prompt here..."}
                className="w-full bg-gray-800/80 border-2 border-gray-700/60 rounded-xl p-4 pr-14 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none leading-tight disabled:opacity-50"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '200px' }}
                disabled={isLoading || isListening}
                aria-label="Prompt input"
            />
            <button
                type="submit"
                disabled={!promptText.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 text-gray-400 enabled:hover:bg-purple-700/80 enabled:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Send prompt"
            >
                <Icon name="send" className="h-6 w-6" />
            </button>
        </form>

        <Waveform mode={waveformMode} />
        <div className="flex flex-col items-center space-y-2">
          <button 
              type="button" 
              onClick={toggleListening} 
              className={`relative flex justify-center items-center h-20 w-20 rounded-full transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-purple-500/50 active:scale-95 hover:scale-105
                  ${isMicActive 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                  ${isListening ? 'animate-pulse-glow' : ''}`
              }
              aria-label={isMicActive ? 'Turn microphone off' : 'Turn microphone on'}
          >
              <Icon name={getMicIcon()} className={`h-10 w-10 ${isSpeaking ? 'animate-speaking-wave' : ''}`} />
          </button>
          <p key={status} className="text-sm text-gray-400 animate-fade-in-short h-5 flex items-center">
              {micStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Generator;
