export interface LeakageState {
  leakRate: number; // 0 to 100
  pressure: number;
  toolSelected: 'none' | 'clamp' | 'sealant' | 'wrench';
  repairProgress: number; // 0 to 100
}
