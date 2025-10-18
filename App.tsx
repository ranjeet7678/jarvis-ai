import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Generator from './pages/Generator';
import History from './pages/History';
import ScreenCaptureView from './components/ScreenCaptureView';
import VoiceStatusFooter from './components/VoiceStatusFooter';
import { VoiceControlProvider } from './contexts/VoiceControlContext';
import Icon from './components/Icon';
import HeaderStatusIcon from './components/HeaderStatusIcon';

const App: React.FC = () => {
  return (
    <VoiceControlProvider>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
        <ScreenCaptureView />
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-purple-900/50 sticky top-0 z-10">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Icon name="processing" className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-200">Jarvis AI</h1>
            </div>
            <HeaderStatusIcon />
          </nav>
        </header>

        <main className="flex-grow container mx-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Generator />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
        
        <VoiceStatusFooter />
      </div>
    </VoiceControlProvider>
  );
};

export default App;
