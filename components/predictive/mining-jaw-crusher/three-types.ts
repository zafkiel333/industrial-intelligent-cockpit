
export interface JawCrusherState {
  rpm: number;             // Eccentric shaft speed
  jawAngle: number;        // Movable jaw swing angle
  load: number;            // 0-100% Crushing load
  css: number;             // Closed Side Setting (mm)
  temperature: number;     // Bearing temp
  wearMap: number[];       // Wear level at different heights of the jaw plate
}

export interface JawCrusherSceneProps {
  state: JawCrusherState;
  isRunning: boolean;
  viewMode: 'solid' | 'stress' | 'wear';
  onPartSelect: (part: string) => void;
}
