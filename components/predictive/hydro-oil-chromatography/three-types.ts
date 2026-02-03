
export interface GasParticle {
  type: 'H2' | 'CH4' | 'C2H2' | 'CO' | 'C2H4';
  concentration: number; // ppm
}

export interface OilSceneProps {
  oilTemp: number; // Celsius
  gasData: GasParticle[];
  faultLocation?: number[]; // [x, y, z] normalized -1 to 1
  oilClarity: number; // 0-1, 1 is clear
}
