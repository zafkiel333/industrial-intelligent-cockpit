export interface ShipLoaderState {
  chuteAngle: number; // -30 to 30 degrees
  ropeTensionLeft: number; // 0 to 100
  ropeTensionRight: number; // 0 to 100
  isBalanced: boolean;
  motorRunning: boolean;
  motorDirection: 'left' | 'right' | null;
  sensorFault: boolean;
}
