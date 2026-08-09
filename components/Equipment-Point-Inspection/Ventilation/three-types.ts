export interface VentilationSceneConfig {
  fanSpeed: number;
  airFlowDirection: 'in' | 'out';
  isInspecting: boolean;
  thermalWarning: boolean;
}

export type AirParticle = {
  position: [number, number, number];
  velocity: number;
};
