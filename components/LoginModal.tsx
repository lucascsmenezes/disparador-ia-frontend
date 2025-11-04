import React from 'react';
import { GoogleIcon } from './icons';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true">
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-8 text-center ring-1 ring-slate-700">
        <h2 className="text-2xl font-bold text-white mb-3">Autenticação Necessária</h2>
        <p className="text-slate-400 mb-8">
          Para continuar, por favor, faça o login. Algumas plataformas de emprego exigem autenticação para enviar candidaturas em seu nome.
        </p>
        <button
          onClick={onLoginSuccess}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-slate-200"
        >
          <GoogleIcon />
          Entrar com Google
        </button>
        <p className="text-xs text-slate-500 mt-6">
            Isto é uma simulação. Sua conta do Google não será acessada.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;