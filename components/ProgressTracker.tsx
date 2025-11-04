import React, { useRef, useEffect } from 'react';
import type { LogEntry } from '../types';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, KeyIcon } from './icons';

interface ProgressTrackerProps {
  progress: number;
  logs: LogEntry[];
}

const getIconForType = (type: LogEntry['type']) => {
    switch (type) {
        case 'success':
            return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
        case 'error':
            return <AlertTriangleIcon className="w-5 h-5 text-red-400" />;
        case 'auth':
            return <KeyIcon className="w-5 h-5 text-yellow-400" />;
        case 'info':
        default:
            return <InfoIcon className="w-5 h-5 text-blue-400" />;
    }
};

const getTextColorForType = (type: LogEntry['type']) => {
     switch (type) {
        case 'success':
            return 'text-green-300';
        case 'error':
            return 'text-red-300';
        case 'auth':
            return 'text-yellow-300';
        case 'info':
        default:
            return 'text-slate-300';
    }
}


const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress, logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-slate-300">Progresso Geral</span>
          <span className="text-sm font-medium text-slate-300">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div 
        ref={logContainerRef}
        className="h-64 bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-y-auto"
      >
        <ul className="space-y-3">
          {logs.map((log, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5">{getIconForType(log.type)}</span>
                <span className={`flex-1 ${getTextColorForType(log.type)}`}>{log.message}</span>
                <span className="text-slate-500 text-xs">{log.timestamp.toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProgressTracker;