import React from 'react';

export type IconName = 'processing' | 'clipboard' | 'check' | 'microphone' | 'video' | 'stop-circle' | 'speaking' | 'error' | 'send' | 'microphone-slash';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const ICONS: Record<IconName, React.ReactNode> = {
  processing: (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <circle cx="12" cy="12" r="6" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <circle cx="12" cy="12" r="2" strokeWidth="1.5" stroke="currentColor" fill="none" />
    </>
  ),
  clipboard: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25H9.75A2.25 2.25 0 0 1 7.5 4.5v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
    />
  ),
  check: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  ),
  microphone: (
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v3" />
    </>
  ),
  'microphone-slash': (
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" />
    </>
  ),
  video: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  ),
  'stop-circle': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  ),
  speaking: (
    <g style={{ transformOrigin: 'bottom' }} fill="currentColor">
      <rect className="wave-bar-1" x="7" y="10" width="2.5" height="5" rx="1.25" />
      <rect className="wave-bar-2" x="10.75" y="6" width="2.5" height="13" rx="1.25" />
      <rect className="wave-bar-3" x="14.5" y="10" width="2.5" height="5" rx="1.25" />
    </g>
  ),
  error: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  ),
  send: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
  )
};

const Icon: React.FC<IconProps> = ({ name, className = 'h-6 w-6', ...props }) => {
  const isSpeaking = name === 'speaking';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={isSpeaking ? 0 : 1.5}
      stroke="currentColor"
      className={className}
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
};

export default Icon;