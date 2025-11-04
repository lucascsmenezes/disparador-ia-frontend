import React from 'react';
import { SearchSession, AppState } from '../types';
import { XIcon, FileIcon, AlertTriangleIcon, CheckCircleIcon } from './icons';

interface HistoryModalProps {
  sessions: SearchSession[];
  onClose: () => void;
  onClear: () => void;
}

const HistoryItem: React.FC<{ session: SearchSession }> = ({ session }) => {
    const isSuccess = session.status === AppState.Finished;
    const date = new Date(session.date);

    return (
        <li className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <p className="font-semibold text-slate-200">{session.resumeObjective}</p>
                    <p className="text-sm text-slate-400">
                        {session.location.city}, {session.location.state}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <FileIcon className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{session.resumeFileName}</span>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <span 
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
                            isSuccess 
                                ? 'bg-green-500/10 text-green-300' 
                                : 'bg-red-500/10 text-red-300'
                        }`}
                    >
                        {isSuccess ? <CheckCircleIcon className="w-3.5 h-3.5"/> : <AlertTriangleIcon className="w-3.5 h-3.5"/>}
                        {isSuccess ? 'Concluído' : 'Erro'}
                    </span>
                     <p className="text-xs text-slate-500 mt-1">
                        {date.toLocaleDateString()} {date.toLocaleTimeString()}
                     </p>
                </div>
            </div>
             {session.companies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-sm text-slate-400">
                        {isSuccess ? 'Enviado para' : 'Encontradas'} {session.companies.length} empresa(s).
                    </p>
                </div>
             )}
        </li>
    );
};

const HistoryModal: React.FC<HistoryModalProps> = ({ sessions, onClose, onClear }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true">
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 ring-1 ring-slate-700 flex flex-col max-h-[90vh]">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Histórico de Buscas</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto flex-grow">
            {sessions.length > 0 ? (
                <ul className="space-y-4">
                    {sessions.map(session => (
                        <HistoryItem key={session.id} session={session} />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-slate-300">Nenhuma busca registrada</h3>
                    <p className="text-slate-500 mt-2">Seu histórico de buscas aparecerá aqui.</p>
                </div>
            )}
        </div>

        {sessions.length > 0 && (
            <footer className="p-4 border-t border-slate-700 text-right flex-shrink-0">
                <button
                    onClick={onClear}
                    className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors"
                >
                    Limpar Histórico
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;