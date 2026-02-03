
export interface RunnerSceneProps {
  rpm: number;
  cavitationIntensity: number; // 0-100%
  crackSeverity: number; // 0-100%
  showStressMap?: boolean;
  viewMode?: 'solid' | 'wireframe' | 'thermal';
}
