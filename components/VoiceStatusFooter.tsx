import React, { useContext } from 'react';
import { VoiceControlContext } from '../contexts/VoiceControlContext';
import Icon, { type IconName } from './Icon';

const VoiceStatusFooter: React.FC = () => {
  const { status, transcript, isCapturing, isSpeaking } = useContext(VoiceControlContext);

  const getStatusInfo = (): { icon: IconName; text: string; color: string; animation: string } => {
    if (isSpeaking) {
        return { icon: 'speaking', text: 'Jarvis is speaking...', color: 'text-fuchsia-400', animation: 'animate-speaking-wave' };
    }

    switch (status) {
      case 'listening':
        return { icon: 'microphone', text: "I'm listening...", color: 'text-purple-400', animation: 'animate-pulse-slow' };
      case 'processing':
        return { icon: 'processing', text: 'Processing your request...', color: 'text-cyan-400', animation: 'animate-spin' };
      case 'error':
        return { icon: 'error', text: 'Network error. Click mic to retry.', color: 'text-red-400', animation: '' };
      case 'sleeping':
      default:
        return { icon: 'microphone-slash', text: "Say 'Jarvis' to wake me up.", color: 'text-gray-500', animation: '' };
    }
  };

  const { icon, text, color, animation } = getStatusInfo();

  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-purple-900/50 sticky bottom-0 z-10">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between min-h-[60px]">
        <div className="flex items-center space-x-3">
          <Icon name={icon} className={`h-6 w-6 ${color} ${animation} transition-all duration-300`} />
          <div className="flex flex-col">
            <span key={text} className={`font-semibold ${color} transition-colors duration-300 animate-fade-in-short`}>{text}</span>
            {status === 'listening' && transcript && (
              <span className="text-sm text-gray-400 italic animate-fade-in-short">"{transcript}"</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isCapturing && (
            <div className="flex items-center space-x-2 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Capturing</span>
            </div>
          )}
          <span className="text-sm text-gray-500">Voice Control Active</span>
        </div>
      </div>
    </footer>
  );
};

export default VoiceStatusFooter;