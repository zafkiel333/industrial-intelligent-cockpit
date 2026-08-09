export interface HoistState {
  gateOpening: number; // 0 to 100
  motorTemp: number;
  isOperating: boolean;
  direction: 'up' | 'down' | 'stop';
}
