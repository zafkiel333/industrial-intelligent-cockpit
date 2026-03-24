export interface TailingsSceneProps {
  isInspecting: boolean;
  scanProgress: number;
  showSeepageLine: boolean;
}

export type SensorNode = {
  id: string;
  position: [number, number, number];
  value: number;
  status: 'online' | 'warning' | 'offline';
};
