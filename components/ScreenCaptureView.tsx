import React, { useContext, useEffect, useRef } from 'react';
import { VoiceControlContext } from '../contexts/VoiceControlContext';

const ScreenCaptureView: React.FC = () => {
  const { isCapturing, stream } = useContext(VoiceControlContext);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  if (!isCapturing) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 bg-black border-2 border-red-500 rounded-lg shadow-2xl overflow-hidden animate-pop-in w-72">
      <video ref={videoRef} autoPlay muted className="w-full h-auto" />
      <div className="absolute top-2 left-2 flex items-center space-x-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-md animate-pulse">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-white font-semibold text-sm tracking-wider">REC</span>
      </div>
    </div>
  );
};

export default ScreenCaptureView;
