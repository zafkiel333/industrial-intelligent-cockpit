export interface SCADAState {
  status: 'normal' | 'crashed' | 'rebooting';
  progress: number;
  activeNode: number;
}
