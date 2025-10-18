import React, { useState, useEffect, useContext } from 'react';
import { getHistory } from '../services/historyService';
import type { HistoryItem } from '../types';
import { VoiceControlContext } from '../contexts/VoiceControlContext';

const History: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const { historyVersion } = useContext(VoiceControlContext);

    useEffect(() => {
        setHistory(getHistory());
    }, [historyVersion]);


    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-200">Generation History</h2>
            </div>
            
            {history.length === 0 ? (
                <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-lg">Your history is empty.</p>
                    <p className="text-gray-500 mt-2">Ask Jarvis a question to see your history here.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {history.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 stagger-item"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                           <div className="mb-4">
                               <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                               <p className="mt-2 text-gray-300 italic">You asked: "{item.prompt}"</p>
                            </div>
                            <div className="mt-4 bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                                <pre className="text-gray-300 font-sans whitespace-pre-wrap break-words">
                                    {item.result}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;