export interface FluidCouplingState {
  oilLevel: number; // 0 to 100 %
  temperature: number; // 20 to 150 °C
  motorSpeed: number; // 0 to 1500 RPM
  isRunning: boolean;
  fusiblePlugBlown: boolean;
}
