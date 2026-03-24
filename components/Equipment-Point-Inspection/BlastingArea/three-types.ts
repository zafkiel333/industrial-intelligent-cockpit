export interface BlastingSceneConfig {
  activeHoleId?: string;
  isSimulating: boolean;
  blastRadius: number;
}

export type BlastingHole = {
  id: string;
  position: [number, number, number];
  depth: number;
  status: 'empty' | 'loaded' | 'stemmed';
};
