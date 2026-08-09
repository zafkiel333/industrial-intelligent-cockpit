export interface PortPipelineState {
  flowVelocity: number;
  pressurePulsation: number;
  vibrationFrequency: number;
  valveStatus: 'OPEN' | 'CLOSED';
  temperature: number;
  viscosity: number;
}
