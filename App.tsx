import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Company, Location, LogEntry, AppState, SearchSession } from './types';
import { fetchCompanies, fetchResumeObjective } from './services/geminiService';
import { sendEmailNotification } from './services/emailService';
import { AppHeader } from './components/AppHeader';
import FileUpload from './components/FileUpload';
import LocationSelector from './components/LocationSelector';
import ProgressTracker from './components/ProgressTracker';
import LoginModal from './components/LoginModal';
import ConfirmationSummary from './components/ConfirmationSummary';
import HistoryModal from './components/HistoryModal';
import { LoadingSpinnerIcon, RocketIcon } from './components/icons';

const App: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [location, setLocation] = useState<Location>({ state: '', city: '' });
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [progress, setProgress] = useState(0);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [platformFilters, setPlatformFilters] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeObjective, setResumeObjective] = useState<string>('');
  const [history, setHistory] = useState<SearchSession[]>([]);
  
  const intervalRef = useRef<number | null>(null);
  const companyIndexRef = useRef(0);
  const userEmail = "lucas.cs.menezes@gmail.com"; // Hardcoded for this example

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('job_search_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
    }
  }, []);

  const saveSession = (status: AppState.Finished | AppState.Error) => {
      const newSession: SearchSession = {
          id: new Date().toISOString(),
          date: new Date().toISOString(),
          resumeFileName: resumeFile?.name || 'N/A',
          location,
          resumeObjective: resumeObjective || 'Não identificado',
          companies,
          status,
      };
      setHistory(prevHistory => {
          const updatedHistory = [newSession, ...prevHistory];
          localStorage.setItem('job_search_history', JSON.stringify(updatedHistory));
          return updatedHistory;
      });
  };

  const clearSendingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'auth' = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    addLog('Autenticação bem-sucedida. Retomando os envios...', 'success');
    startSendingProcess(companyIndexRef.current);
  };
  
  const startSendingProcess = useCallback((startIndex: number) => {
    companyIndexRef.current = startIndex;
    
    intervalRef.current = window.setInterval(() => {
        if (companyIndexRef.current >= companies.length) {
            clearSendingInterval();
            setAppState(AppState.Finished);
            saveSession(AppState.Finished);
            addLog(`Processo concluído! Currículo enviado para ${companies.length} empresas.`, 'success');
            setProgress(100);

            // Send success email notification
            addLog(`Enviando e-mail de confirmação para ${userEmail}...`, 'info');
            sendEmailNotification('success', userEmail, {
              companies,
              resumeFileName: resumeFile?.name || 'N/A',
              resumeObjective,
            }).then(() => {
              addLog('E-mail de confirmação enviado.', 'success');
            }).catch((emailError: unknown) => {
              // FIX: Handle potential errors from email service by logging detailed message.
              let emailErrorMessage = 'Falha ao enviar e-mail de confirmação.';
              if (emailError instanceof Error) {
                emailErrorMessage += ` Detalhes: ${emailError.message}`;
              } else if (typeof emailError === 'string') {
                emailErrorMessage += ` Detalhes: ${emailError}`;
              }
              addLog(emailErrorMessage, 'error');
            });
            return;
        }

        const company = companies[companyIndexRef.current];

        // Simulate a login requirement for a platform
        if (Math.random() < 0.05 && companyIndexRef.current > 0) { // 5% chance to require login
            clearSendingInterval();
            addLog(`Autenticação necessária para ${company.platform}.`, 'auth');
            setShowLoginModal(true);
            return;
        }
        
        // Simulate different sending statuses for a more realistic log
        const randomStatus = Math.random();
        if (randomStatus < 0.7) { // 70% success
            addLog(`Currículo enviado com sucesso para ${company.name}!`, 'success');
        } else if (randomStatus < 0.85) { // 15% already applied
            addLog(`Você já possui uma candidatura ativa em ${company.name}.`, 'info');
        } else if (randomStatus < 0.95) { // 10% failure
            addLog(`Falha ao se candidatar para ${company.name} via ${company.platform}.`, 'error');
        } else { // 5% pending review
            addLog(`Candidatura para ${company.name} enviada e aguardando revisão.`, 'info');
        }
        
        companyIndexRef.current++;
        const newProgress = Math.round((companyIndexRef.current / companies.length) * 100);
        setProgress(newProgress);

    }, 350);
  }, [companies, resumeFile, resumeObjective, location]);

  useEffect(() => {
    if (appState === AppState.Sending && companies.length > 0) {
      startSendingProcess(0);
    }
    return () => clearSendingInterval();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, companies, startSendingProcess]);

  useEffect(() => {
    if (allCompanies.length > 0) {
        const filtered = allCompanies.filter(company => platformFilters.has(company.platform));
        setCompanies(filtered);
    }
  }, [platformFilters, allCompanies]);

  const handleFetchCompanies = async () => {
    if (!resumeFile || !location.state || !location.city) {
      setError('Por favor, envie um currículo e selecione uma localidade.');
      return;
    }
    setError(null);
    setLogs([]);
    setProgress(0);
    setCompanies([]);
    setAllCompanies([]);
    setAppState(AppState.Fetching);
    addLog('Iniciando processo...', 'info');
    
    try {
      addLog('Analisando objetivo do currículo...', 'info');
      const objective = await fetchResumeObjective(resumeFile.name);
      setResumeObjective(objective);
      addLog(`Objetivo identificado: ${objective}`, 'success');

      addLog(`Procurando empresas em ${location.city}, ${location.state} for "${objective}"...`, 'info');
      const fetchedCompanies = await fetchCompanies(location, objective);
      if (fetchedCompanies.length === 0) {
        throw new Error("Não foi possível encontrar empresas que correspondam aos seus critérios.");
      }
      
      const uniquePlatforms = new Set(fetchedCompanies.map(c => c.platform));
      setAllCompanies(fetchedCompanies);
      setPlatformFilters(uniquePlatforms);
      addLog(`Encontradas ${fetchedCompanies.length} empresas em potencial.`, 'success');
      setAppState(AppState.ReadyToSend);

    } catch (e: unknown) {
      let errorMessage = 'Ocorreu um erro desconhecido.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }

      setError(`Falha ao buscar empresas. ${errorMessage}`);
      addLog(`Erro: ${errorMessage}`, 'error');
      setAppState(AppState.Error);
      saveSession(AppState.Error);

      // Send error email notification
      addLog(`Enviando e-mail de notificação de erro para ${userEmail}...`, 'info');
      sendEmailNotification('error', userEmail, { error: errorMessage })
        .then(() => {
          addLog('E-mail de notificação de erro enviado.', 'success');
        })
        .catch((emailError: unknown) => {
          // FIX: Handle potential errors from email service by logging detailed message.
          let emailErrorMessage = 'Falha ao enviar e-mail de notificação de erro.';
          if (emailError instanceof Error) {
            emailErrorMessage += ` Detalhes: ${emailError.message}`;
          } else if (typeof emailError === 'string') {
            emailErrorMessage += ` Detalhes: ${emailError}`;
          }
          addLog(emailErrorMessage, 'error');
        });
    }
  };
  
  const handlePlatformFilterChange = (platform: string) => {
    setPlatformFilters(prev => {
        const newFilters = new Set(prev);
        if (newFilters.has(platform)) {
            newFilters.delete(platform);
        } else {
            newFilters.add(platform);
        }
        return newFilters;
    });
  };

  const handleStartSending = () => {
    if (companies.length === 0) {
        setError("Nenhuma empresa selecionada. Por favor, ajuste os filtros.");
        return;
    }
    setError(null);
    addLog(`Iniciando envio para ${companies.length} empresas selecionadas...`, 'info');
    setAppState(AppState.Sending);
  };

  const handleReset = () => {
      setResumeFile(null);
      setLocation({ state: '', city: ''});
      setAppState(AppState.Idle);
      setProgress(0);
      setCompanies([]);
      setAllCompanies([]);
      setPlatformFilters(new Set());
      setLogs([]);
      setShowLoginModal(false);
      setError(null);
      setResumeObjective('');
      companyIndexRef.current = 0;
      clearSendingInterval();
  };

  const handleClearHistory = () => {
      setHistory([]);
      localStorage.removeItem('job_search_history');
      setShowHistoryModal(false);
  }

  const isIdle = appState === AppState.Idle;
  const isFormDisabled = appState !== AppState.Idle;
  const isProcessing = appState === AppState.Fetching || appState === AppState.Sending;
  const isFinished = appState === AppState.Finished || appState === AppState.Error;
  
  const uniquePlatforms = [...new Set(allCompanies.map(c => c.platform))].sort();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <AppHeader onHistoryClick={() => setShowHistoryModal(true)} hasHistory={history.length > 0} />

        <main className="mt-8 bg-slate-900/50 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-primary-950/20 ring-1 ring-slate-800">
           {isFinished ? (
              appState === AppState.Finished ? (
                  <ConfirmationSummary 
                      companies={companies}
                      resumeFileName={resumeFile?.name || 'Não aplicável'}
                      email={userEmail}
                      onReset={handleReset}
                      resumeObjective={resumeObjective}
                  />
              ) : ( // This handles AppState.Error
                  <div className="text-center">
                      <h2 className="text-2xl font-bold text-red-400 mb-4">
                          Ocorreu um Erro
                      </h2>
                      <p className="text-slate-400 mb-6">
                          {error}
                      </p>
                      <button
                        onClick={handleReset}
                        className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-primary-600/20"
                      >
                        Tentar Novamente
                      </button>
                  </div>
              )
          ) : (
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <h2 className="text-xl font-semibold text-primary-400 mb-4">1. Seu Currículo</h2>
                <FileUpload file={resumeFile} setFile={setResumeFile} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-400 mb-4">2. Localidade Alvo</h2>
                <LocationSelector location={location} setLocation={setLocation} />
              </div>
            </div>
          )}

          {error && !isProcessing && <p className="text-red-400 mt-4 text-center">{error}</p>}
          
          {isIdle && (
             <div className="mt-8 text-center">
                <button
                    onClick={handleFetchCompanies}
                    disabled={!resumeFile || !location.city}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out hover:bg-primary-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 shadow-lg hover:shadow-primary-500/40 disabled:shadow-none"
                >
                    <RocketIcon />
                    Buscar Empresas
                </button>
            </div>
          )}

          {appState === AppState.ReadyToSend && (
            <div className="mt-8 pt-8 border-t border-slate-800 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-primary-400 mb-2">3. Filtre e Confirme</h2>
                <p className="text-slate-400 mb-4">Selecione as plataformas para as quais deseja enviar seu currículo.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 my-4">
                  {uniquePlatforms.map(platform => (
                      <button
                          key={platform}
                          onClick={() => handlePlatformFilterChange(platform)}
                          className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
                              platformFilters.has(platform)
                                  ? 'bg-primary-600 border-primary-500 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                          }`}
                      >
                          {platform}
                      </button>
                  ))}
              </div>
              <div className="mt-8 text-center">
                  <button
                      onClick={handleStartSending}
                      disabled={companies.length === 0}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out hover:bg-primary-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 shadow-lg hover:shadow-primary-500/40 disabled:shadow-none"
                  >
                      <RocketIcon />
                      {`Iniciar Envios para ${companies.length} ${companies.length === 1 ? 'Empresa' : 'Empresas'}`}
                  </button>
              </div>
            </div>
          )}
          
          {(isProcessing || isFinished) && (
            <div className="mt-8 pt-8 border-t border-slate-800">
               <h2 className="text-xl font-semibold text-primary-400 mb-4 text-center">
                  {appState === AppState.Fetching && 'Procurando Empresas...'}
                  {appState === AppState.Sending && `Enviando para ${companies.length} Empresas...`}
                  {(appState === AppState.Finished || appState === AppState.Error) && 'Registro do Processo'}
                </h2>
                {isProcessing && (
                  <div className="flex justify-center items-center my-4">
                      <LoadingSpinnerIcon />
                  </div>
                )}
              <ProgressTracker progress={progress} logs={logs} />
            </div>
          )}

        </main>
      </div>
      {showLoginModal && <LoginModal onLoginSuccess={handleLoginSuccess} />}
      {showHistoryModal && <HistoryModal sessions={history} onClose={() => setShowHistoryModal(false)} onClear={handleClearHistory} />}
    </div>
  );
};

export default App;