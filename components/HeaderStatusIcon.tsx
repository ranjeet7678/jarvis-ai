import React, { useContext } from 'react';
import { VoiceControlContext } from '../contexts/VoiceControlContext';
import Icon, { type IconName } from './Icon';

const HeaderStatusIcon: React.FC = () => {
    const { status, isSpeaking } = useContext(VoiceControlContext);

    const getStatusInfo = (): { icon: IconName; text: string; color: string; animation: string } => {
        if (isSpeaking) {
            return { icon: 'speaking', text: 'Speaking', color: 'text-fuchsia-400', animation: 'animate-speaking-wave' };
        }
    
        switch (status) {
          case 'listening':
            return { icon: 'microphone', text: 'Listening', color: 'text-purple-400', animation: 'animate-pulse-slow' };
          case 'processing':
            return { icon: 'processing', text: 'Processing', color: 'text-cyan-400', animation: 'animate-spin' };
          case 'error':
            return { icon: 'error', text: 'Network Error', color: 'text-red-400', animation: '' };
          case 'sleeping':
          default:
            return { icon: 'microphone-slash', text: 'Sleeping', color: 'text-gray-500', animation: '' };
        }
    };
    
    const { icon, text, color, animation } = getStatusInfo();

    return (
        <div className="relative group flex items-center">
            <Icon name={icon} className={`h-7 w-7 ${color} ${animation} transition-all duration-300`} />
            <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 px-3 py-1.5 bg-gray-700 text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20">
                {text}
                <svg className="absolute text-gray-700 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                </svg>
            </div>
        </div>
    );
};

export default HeaderStatusIcon;