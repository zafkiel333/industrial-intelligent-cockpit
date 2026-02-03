
export interface StatePoint {
  x: number; // e.g., Load
  y: number; // e.g., Vibration
  z: number; // e.g., Temperature
  color?: string;
}

export interface DegradationSceneProps {
  currentPoint: StatePoint;
  historyPath: StatePoint[];
  predictionPaths: StatePoint[][]; // Multiple future scenarios
  showEnvelope?: boolean; // Show safety limit boundary
}
