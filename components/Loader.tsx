import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const loadingMessages = [
  'Jarvis is thinking...',
  'Consulting the digital cosmos...',
  'Analyzing your query...',
  'Synthesizing a response...',
  'Just a moment...',
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/60 border border-purple-900/50 rounded-xl shadow-2xl backdrop-blur-sm animate-fade-in-short w-full max-w-md">
      <div className="animate-pulse-and-rotate text-purple-400">
        <Icon name="processing" className="h-16 w-16" />
      </div>
      <p className="mt-6 text-lg text-gray-300 h-6 animate-fade-in-short" key={message}>
        {message}
      </p>
    </div>
  );
};

export default Loader;