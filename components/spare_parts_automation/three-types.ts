
export interface PLCModule {
  id: string;
  name: string;
  slotIndex: number; // 0-10
  type: 'CPU' | 'IO' | 'COMM' | 'PWR' | 'EMPTY';
  status: 'normal' | 'warning' | 'error' | 'empty';
  temperature: number;
  firmware: string;
}

export interface AutomationThreeProps {
  modules: PLCModule[];
  activeModuleId: string | null;
  onModuleSelect: (id: string) => void;
  isDiagnosing: boolean;
}
