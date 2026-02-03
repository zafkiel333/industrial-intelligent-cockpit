
export interface RotorUnbalanceProps {
  rpm: number;
  vibrationAmp: number; // um
  phaseAngle: number; // degrees (Lag angle)
  heavySpotAngle: number; // degrees
  showVectors?: boolean;
  showOrbit?: boolean;
}
