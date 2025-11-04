import React from 'react';
import { BotIcon, HistoryIcon } from './icons';

interface AppHeaderProps {
    onHistoryClick: () => void;
    hasHistory: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onHistoryClick, hasHistory }) => {
    return (
        <header className="text-center relative">
          <div className="inline-flex items-center gap-3 justify-center mb-4">
            <div className="bg-primary-500/20 p-3 rounded-full">
              <BotIcon className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-100">
              Disparador Automático de Currículos <span className="text-primary-400">IA</span>
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-lg text-slate-400">
            Maximize sua busca por emprego. Envie seu currículo, defina sua localidade alvo e deixe nossa IA cuidar das candidaturas.
          </p>
          {hasHistory && (
             <button
                onClick={onHistoryClick}
                title="Ver histórico de buscas"
                className="absolute top-0 right-0 p-2 text-slate-400 hover:text-primary-400 transition-colors rounded-full hover:bg-slate-800"
              >
                <HistoryIcon className="w-6 h-6" />
              </button>
          )}
        </header>
    );
}