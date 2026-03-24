export interface RailSceneConfig {
  locomotivePos: number;
  isScanning: boolean;
  defectAlert: boolean;
  tunnelColor: string;
  railColor: string;
}

export type MiningObject = {
  id: string;
  type: 'locomotive' | 'track' | 'switch' | 'rock';
  position: [number, number, number];
};
