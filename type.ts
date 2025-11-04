export interface Company {
  name: string;
  jobUrl: string;
  platform: string;
}

export interface Location {
  state: string;
  city: string;
}

export interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'auth';
  timestamp: Date;
}

export enum AppState {
    Idle = 'IDLE',
    Fetching = 'FETCHING',
    ReadyToSend = 'READY_TO_SEND',
    Sending = 'SENDING',
    Finished = 'FINISHED',
    Error = 'ERROR',
}

export interface SearchSession {
  id: string;
  date: string;
  resumeFileName: string;
  location: Location;
  resumeObjective: string;
  companies: Company[];
  status: AppState.Finished | AppState.Error;
}