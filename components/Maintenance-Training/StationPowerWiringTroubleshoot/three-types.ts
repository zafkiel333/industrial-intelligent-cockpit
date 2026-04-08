export interface WiringState {
  faultInjected: boolean;
  multimeterMode: 'V' | 'Ω' | 'OFF';
  probes: { red: string | null, black: string | null };
}
