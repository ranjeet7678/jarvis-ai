import React from 'react';

interface CodeBlockProps {
  title: string;
  content: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, content }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden my-4">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h3>
      </div>
      <pre className="p-4 text-sm text-green-300 font-mono whitespace-pre-wrap break-words">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;