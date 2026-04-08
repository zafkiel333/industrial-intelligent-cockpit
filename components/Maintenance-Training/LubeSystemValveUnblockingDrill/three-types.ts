export interface LubeValveState {
  pressure: number; // bar
  isPumpOn: boolean;
  valve1Blocked: boolean;
  valve2Blocked: boolean;
  valve3Blocked: boolean;
  valve1Flow: number; // 0-100%
  valve2Flow: number;
  valve3Flow: number;
  isHeating: boolean;
  temperature: number; // Celsius
  selectedValve: number | null;
}
