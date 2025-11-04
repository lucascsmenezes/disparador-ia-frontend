import React from 'react';
import type { Company } from '../types';
import { CheckCircleIcon, MailIcon } from './icons';

interface ConfirmationSummaryProps {
  companies: Company[];
  resumeFileName: string;
  email: string;
  onReset: () => void;
  resumeObjective: string;
}

const ConfirmationSummary: React.FC<ConfirmationSummaryProps> = ({ companies, resumeFileName, email, onReset, resumeObjective }) => {
  return (
    <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center bg-green-500/10 p-3 rounded-full mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-400" />
        </div>
      <h2 className="text-2xl font-bold text-primary-400 mb-2">
          Envios Concluídos!
      </h2>
      <p className="text-slate-400 mb-8">
          Seu currículo foi enviado para {companies.length} empresas. Um resumo está detalhado abaixo.
      </p>

      <div className="bg-slate-900/70 border border-slate-800 rounded-lg text-left p-6 mb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
          <MailIcon className="w-6 h-6 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-200">Confirmação de Envio</h3>
        </div>
        
        <div className="space-y-4 text-sm">
            <div className="grid grid-cols-[90px_1fr] gap-2 items-center">
                <span className="font-semibold text-slate-400">Para:</span>
                <span className="text-slate-300 font-mono break-all">{email}</span>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-2 items-center">
                <span className="font-semibold text-slate-400">Assunto:</span>
                <span className="text-slate-300">Currículo: {resumeObjective}</span>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-2 items-center">
                <span className="font-semibold text-slate-400">Currículo:</span>
                <span className="text-slate-300 truncate">{resumeFileName}</span>
            </div>
        </div>

        <div className="mt-6">
            <h4 className="font-semibold text-slate-400 mb-3">Empresas Contatadas:</h4>
            <div className="max-h-60 overflow-y-auto bg-slate-950 p-4 rounded-md border border-slate-700/50 space-y-3">
                {companies.map((company, index) => (
                    <div key={index} className="flex justify-between items-center text-sm gap-4">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-slate-300 truncate">{company.name}</span>
                            <span className="text-xs font-semibold bg-primary-800 text-primary-300 px-2 py-0.5 rounded-full flex-shrink-0">{company.platform}</span>
                        </div>
                        <a 
                            href={company.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 hover:underline text-xs flex-shrink-0"
                        >
                            Ver Vagas
                        </a>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-primary-600/20"
      >
        Iniciar Nova Busca
      </button>
    </div>
  );
};

export default ConfirmationSummary;