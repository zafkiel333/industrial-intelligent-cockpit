export interface AlignmentState {
  deviation: number; // mm, positive is right, negative is left
  speed: number; // m/s
  load: number; // %
  isCorrecting: boolean;
}

export interface RollerStatus {
  id: string;
  temperature: number; // °C
  vibration: number; // mm/s
}
